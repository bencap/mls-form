import pandas as pd
import numpy as np
import datetime
import logging
import os

import azure.functions as func
import azure.cosmos as cos


def main(mytimer: func.TimerRequest) -> None:
    utc_timestamp = datetime.datetime.utcnow().replace(
        tzinfo=datetime.timezone.utc).isoformat()

    if mytimer.past_due:
        logging.info('The timer is past due!')

    logging.info('Python timer trigger function ran at %s', utc_timestamp)

    fixtures = fixHeaderRows(allFixtures())
    results, upcoming = splitScoresAndFixtures(fixtures)
    logging.info('Fixtures Retrieved')

    cosmosClient = cosmosConnection()
    fixtureClient = fixtureConnection(mlsConnection(cosmosClient))
    logging.info('Connected to Cosmos Instance')

    for club in results["Home"].unique(): # TODO: make this the intersection of home and away so that teams with no home games yet will still get populated
        record = buildClubRecord(
            club,
            results.loc[(results['Home'] == club) | (results['Away'] == club)],
            upcoming.loc[(upcoming['Home'] == club) |
                         (upcoming['Away'] == club)],
        )
        upsertClub(fixtureClient, record)
        logging.info(f"Updated fixtures for {club}")

    logging.info("Fixture update complete")


def allFixtures():
    """scrapes the mls fixture data from FBref.com"""
    return pd.read_html(
        "https://fbref.com/en/comps/22/schedule/Major-League-Soccer-Scores-and-Fixtures"
    )[0]


def fixHeaderRows(allFixtures):
    """scraper also grabs non-game header rows, get rid of those"""
    return allFixtures[allFixtures["Score"] != "Score"]


def splitScoresAndFixtures(allFixtures):
    """split off completed games from upcoming games"""
    scores = allFixtures[allFixtures["Score"].notnull()]
    upcoming = allFixtures[allFixtures["Score"].isnull()]

    return scores, upcoming


def buildClubRecord(club, clubComplete, clubUpcoming):
    """build the clubs' season

        this function forms our data for complete games and
        notes upcoming games, as well as changing the paradigm
        from home/away to club/opponent. We also calculate simple
        season long statistics at this step which are displayed as
        the default on homepage (for quicker loading)

        Arguments:
            club -- the name of the team being built
            clubComplete -- a list of the games already played by the club
            clubUpcoming -- a list of the games yet to play for the club

        Returns:
            A dictionary with stats and fixtures for the club being built 
    """

    complete = [recordFromRow(club, row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], True) for row in zip(clubComplete["Day"], clubComplete["Date"],
                                                                                                                    clubComplete["Time"], clubComplete["Home"], clubComplete["xG"], clubComplete["Score"], clubComplete["Away"], clubComplete["xG.1"])]
    upcoming = [recordFromRow(club, row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], False) for row in zip(clubUpcoming["Day"], clubUpcoming["Date"],
                                                                                                                    clubUpcoming["Time"], clubUpcoming["Home"], clubUpcoming["xG"], clubUpcoming["Score"], clubUpcoming["Away"], clubUpcoming["xG.1"])]

    # TODO: scrape east/west or add east/west somehow
    record = {
        "club": club,
        "scores": complete,
        "upcoming": upcoming,
    }

    # updates record dict w stats dict entries
    record.update(clubSimpleStats(complete))
    
    return record


def recordFromRow(club, day, date, time, home, xg_h, score, away, xg_a, played):
    """Build a clubs fixture from a scraped record, change the 
       paradigm from home/away to club/opponent

    Arguments:
        club -- the name of the team being built
        day -- the day of the week the game was played
        date -- the date on which the game was played
        time -- the time at which the game was played
        home -- the name of the home team
        xg_h -- the expected goals for the home team
        score -- the final score of the game
        away -- the name of the away team
        xg_a -- the expected goals for the away team
        played -- whether the game being built has been played or not

    Returns:
        A dictionary containing the fixture data
    """

    if played:
        # change data to club/opponent based on team in home slot
        if home == club:
            opp, home, xG_club, xG_opp, score_club, score_opp = away, True, float(xg_h), float(xg_a), int(score.split("–")[0]), int(score.split("–")[1])
        else:
            opp, home, xG_club, xG_opp, score_club, score_opp = home, False, float(xg_a), float(xg_h), int(score.split("–")[1]), int(score.split("–")[0])

        if score_club > score_opp:
            res = "W"
        elif score_club == score_opp:
            res = "T"
        else:
            res = "L"

        return {
            "Day": day,
            "Date": date,
            "Time": time,
            "Opponent": opp,
            "xG_club": xG_club,
            "score_club": score_club,
            "xG_opponent": xG_opp,
            "score_opponent": score_opp,
            "played": played,
            "Home": home,
            "Result": res
        }
    else:
        opp, home = (away, True) if home == club else (home, False)
        return {
            # sometimes scheduling info is unavailable for future games
            "Day": None if pd.isnull(day) else day,
            "Date": None if pd.isnull(date) else date,
            "Time": None if pd.isnull(time) else time,
            "Home": home,
            "Opponent": away,
            "played": played
        }


def clubSimpleStats(fixtureData):
    """build simple team stats based on season fixture data

    Arguments:
        fixtureData -- a list of dictionaries containing data for a teams played fixtures

    Returns:
        A dictionary containing simple season stats for a team
    """

    seasonData = {"GD": 0, "xGD": 0, "GF": 0,
                  "xGF": 0, "GA": 0, "xGA": 0, "PF": 0, "MP": 0, "W": 0, "D": 0, "L": 0}

    for record in fixtureData:
        seasonData["GD"] += record["score_club"] - record["score_opponent"]
        seasonData["xGD"] += record["xG_club"] - record["xG_opponent"]
        seasonData["GF"] += record["score_club"]
        seasonData["xGF"] += record["xG_club"]
        seasonData["GA"] += record["score_opponent"]
        seasonData["xGA"] += record["xG_opponent"]

        seasonData["MP"] += 1
        if record["Result"] == "W":
            seasonData["PF"] += 3
            seasonData["W"] += 1
        elif record["Result"] == "T":
            seasonData["PF"] += 1
            seasonData["D"] += 1
        else:
            seasonData["L"] += 1

    seasonData["xGA"] = round(seasonData["xGA"], 2)
    seasonData["xGF"] = round(seasonData["xGF"], 2)
    seasonData["xGD"] = round(seasonData["xGD"], 2)

    return seasonData


def cosmosConnection():
    """connect to the cosmos client"""
    return cos.CosmosClient.from_connection_string(os.environ["AzureCosmosDBConnectionString"])


def mlsConnection(client):
    """connect to the mls database"""
    return client.get_database_client("mls-data")


def fixtureConnection(db):
    """connect to the fixture database"""
    return db.get_container_client("fixtures")


def upsertClub(container, fixtureData):
    """update/insert a club into the collection"""
    records = container.read_all_items()
    for record in records:
        if record["club"] == fixtureData["club"]:
            record.update(fixtureData)
            return container.upsert_item(record)

    return container.upsert_item(fixtureData)
