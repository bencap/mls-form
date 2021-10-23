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
    logging.info(results.head())
    logging.info('Fixtures Retrieved')

    cosmosClient = cosmosConnection()
    fixtureClient = fixtureConnection(mlsConnection(cosmosClient))
    logging.info('Connected to Cosmos Instance')

    for club in results["Home"].unique():
        record = buildClubRecord(
            club,
            results.loc[(results['Home'] == club) | (results['Away'] == club)],
            upcoming.loc[(upcoming['Home'] == club) | (upcoming['Away'] == club)],
        )
        upsertClub(fixtureClient, record)
        logging.info(f"Updated fixtures for {club}")
    
    logging.info("Fixture update complete")


def allFixtures():
    return pd.read_html(
        "https://fbref.com/en/comps/22/schedule/Major-League-Soccer-Scores-and-Fixtures"
    )[0]


def fixHeaderRows(allFixtures):
    return allFixtures[allFixtures["Score"] != "Score"]


def splitScoresAndFixtures(allFixtures):
    scores = allFixtures[allFixtures["Score"].notnull()]
    upcoming = allFixtures[allFixtures["Score"].isnull()]

    return scores, upcoming


def buildClubRecord(club, clubComplete, clubUpcoming):

    complete = [recordFromRow(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7],  True) for row in zip(clubComplete["Day"], clubComplete["Date"], clubComplete["Time"], clubComplete["Home"], clubComplete["xG"], clubComplete["Score"], clubComplete["Away"], clubComplete["xG.1"])]
    upcoming = [recordFromRow(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], False) for row in zip(clubUpcoming["Day"], clubUpcoming["Date"], clubUpcoming["Time"], clubUpcoming["Home"], clubUpcoming["xG"], clubUpcoming["Score"], clubUpcoming["Away"], clubUpcoming["xG.1"])]

    # TODO: scrape east/west or add east/west somehow
    record = {
        "club": club,
        "scores": complete,
        "upcoming": upcoming,
    }

    return record


def recordFromRow(day, date, time, home, xg_h, score, away, xg_a, played):
    if played:
        return {
            "Day": day,
            "Date": date,
            "Time": time,
            "Home": home,
            "xG_home": float(xg_h),
            "score_home": int(score.split("–")[0]),
            "Away": away,
            "xG_away": float(xg_a),
            "score_away": int(score.split("–")[1]),
            "played": played
        }
    else:
        return {
            # sometimes scheduling info is unavailable for future games
            "Day": None if pd.isnull(day) else day,
            "Date": None if pd.isnull(date) else date,
            "Time": None if pd.isnull(time) else time,
            "Home": home,
            "Away": away,
            "played": played
        }


def cosmosConnection():
    return cos.CosmosClient.from_connection_string(os.environ["ConnectionStrings:AzureCosmosDBConnectionString"])


def mlsConnection(client):
    return client.get_database_client("mls-data")


def fixtureConnection(db):
    return db.get_container_client("fixtures")


def upsertClub(container, fixtureData):
    records = container.read_all_items()
    for record in records:
        if record["club"] == fixtureData["club"]:
            record["scores"] = fixtureData["scores"]
            record["upcoming"] = fixtureData["upcoming"]
            return container.upsert_item(record)

    return container.upsert_item(fixtureData)
