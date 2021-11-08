import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Club } from '../mls-home/containers/mls-home.component';

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private clubURL = 'api/club';

  constructor(private httpClient: HttpClient) { }

  getClubs(): Observable<Club[]> {
    return this.httpClient.get<Club[]>(this.clubURL);
  }

  getClub(club: string): Observable<Club> {
    club = club.trim();

    const options = club ?
      { params: new HttpParams().set('name', club) } : {};

    return this.httpClient.get<Club>(this.clubURL, options);
  }
}
