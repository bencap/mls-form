import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface Club {
  club: string;
  MP: number;
  W: number;
  D: number;
  L: number;
  GD: number;
  xGD: number;
  GF: number;
  xGF: number;
  GA: number;
  xGA: number;
  PF: number;
}

const CLUB_DATA: Club[] = [
  { "club": "Houston Dynamo", "GD": -14, "xGD": -6.9, "GF": 35, "xGF": 37.5, "GA": 49, "xGA": 44.4, "PF": 30, "MP": 31, "W": 6, "D": 12, "L": 13 }, { "club": "Seattle", "GD": 24, "xGD": 9.5, "GF": 50, "xGF": 41.7, "GA": 26, "xGA": 32.2, "PF": 58, "MP": 30, "W": 17, "D": 7, "L": 6 }, { "club": "CF Montréal", "GD": 3, "xGD": 1.5, "GF": 43, "xGF": 41.4, "GA": 40, "xGA": 39.9, "PF": 42, "MP": 30, "W": 11, "D": 9, "L": 10 }, { "club": "Orlando City", "GD": 1, "xGD": 2.2, "GF": 43, "xGF": 39.2, "GA": 42, "xGA": 37, "PF": 46, "MP": 30, "W": 12, "D": 10, "L": 8 }, { "club": "Los Angeles FC", "GD": 2, "xGD": 22.2, "GF": 46, "xGF": 54.3, "GA": 44, "xGA": 32.1, "PF": 40, "MP": 30, "W": 11, "D": 7, "L": 12 }, { "club": "FC Dallas", "GD": -9, "xGD": -6.2, "GF": 41, "xGF": 41.3, "GA": 50, "xGA": 47.5, "PF": 28, "MP": 30, "W": 6, "D": 10, "L": 14 }, { "club": "NY Red Bulls", "GD": 5, "xGD": 1.9, "GF": 35, "xGF": 38.1, "GA": 30, "xGA": 36.2, "PF": 40, "MP": 29, "W": 11, "D": 7, "L": 11 }, { "club": "D.C. United", "GD": 7, "xGD": 17.4, "GF": 51, "xGF": 49.9, "GA": 44, "xGA": 32.5, "PF": 41, "MP": 30, "W": 12, "D": 5, "L": 13 }, { "club": "Chicago Fire", "GD": -16, "xGD": -6.1, "GF": 35, "xGF": 40.1, "GA": 51, "xGA": 46.2, "PF": 31, "MP": 31, "W": 8, "D": 7, "L": 16 }, { "club": "Nashville", "GD": 20, "xGD": 14.4, "GF": 47, "xGF": 41.4, "GA": 27, "xGA": 27, "PF": 49, "MP": 30, "W": 11, "D": 16, "L": 3 }, { "club": "Inter Miami", "GD": -19, "xGD": -17.2, "GF": 28, "xGF": 28.6, "GA": 47, "xGA": 45.8, "PF": 35, "MP": 30, "W": 10, "D": 5, "L": 15 }, { "club": "Columbus Crew", "GD": -3, "xGD": -5.2, "GF": 37, "xGF": 33.9, "GA": 40, "xGA": 39.1, "PF": 38, "MP": 30, "W": 10, "D": 8, "L": 12 }, { "club": "Vancouver", "GD": -1, "xGD": -7.2, "GF": 40, "xGF": 37, "GA": 41, "xGA": 44.2, "PF": 43, "MP": 30, "W": 11, "D": 10, "L": 9 }, { "club": "Sporting KC", "GD": 19, "xGD": 6, "GF": 52, "xGF": 47.7, "GA": 33, "xGA": 41.7, "PF": 52, "MP": 29, "W": 15, "D": 7, "L": 7 }, { "club": "NYCFC", "GD": 11, "xGD": 19.7, "GF": 45, "xGF": 51.1, "GA": 34, "xGA": 31.4, "PF": 41, "MP": 30, "W": 11, "D": 8, "L": 11 }, { "club": "Toronto FC", "GD": -25, "xGD": -13.2, "GF": 34, "xGF": 36.3, "GA": 59, "xGA": 49.5, "PF": 25, "MP": 30, "W": 6, "D": 7, "L": 17 }, { "club": "San Jose", "GD": -7, "xGD": -7.2, "GF": 40, "xGF": 42.7, "GA": 47, "xGA": 49.9, "PF": 36, "MP": 30, "W": 9, "D": 9, "L": 12 }, { "club": "Minnesota Utd", "GD": -2, "xGD": 1.8, "GF": 35, "xGF": 43, "GA": 37, "xGA": 41.2, "PF": 44, "MP": 30, "W": 12, "D": 8, "L": 10 }, { "club": "New England", "GD": 24, "xGD": 11.1, "GF": 62, "xGF": 51.6, "GA": 38, "xGA": 40.5, "PF": 69, "MP": 31, "W": 21, "D": 6, "L": 4 }, { "club": "Philadelphia", "GD": 10, "xGD": 1.9, "GF": 42, "xGF": 39.3, "GA": 32, "xGA": 37.4, "PF": 46, "MP": 30, "W": 12, "D": 10, "L": 8 }, { "club": "Atlanta Utd", "GD": 6, "xGD": -4, "GF": 40, "xGF": 37.7, "GA": 34, "xGA": 41.7, "PF": 43, "MP": 30, "W": 11, "D": 10, "L": 9 }, { "club": "Colorado Rapids", "GD": 11, "xGD": 8, "GF": 43, "xGF": 43, "GA": 32, "xGA": 35, "PF": 52, "MP": 30, "W": 14, "D": 10, "L": 6 }, { "club": "Portland Timbers", "GD": -1, "xGD": -11.6, "GF": 48, "xGF": 41.5, "GA": 49, "xGA": 53.1, "PF": 46, "MP": 30, "W": 14, "D": 4, "L": 12 }, { "club": "LA Galaxy", "GD": -2, "xGD": -3.6, "GF": 44, "xGF": 43.5, "GA": 46, "xGA": 47.1, "PF": 45, "MP": 30, "W": 13, "D": 6, "L": 11 }, { "club": "Real Salt Lake", "GD": 3, "xGD": -0.7, "GF": 48, "xGF": 39.7, "GA": 45, "xGA": 40.4, "PF": 42, "MP": 29, "W": 12, "D": 6, "L": 11 }, { "club": "FC Cincinnati", "GD": -27, "xGD": -18.3, "GF": 32, "xGF": 34, "GA": 59, "xGA": 52.3, "PF": 20, "MP": 30, "W": 4, "D": 8, "L": 18 }, { "club": "Austin FC", "GD": -20, "xGD": -10.2, "GF": 29, "xGF": 39.8, "GA": 49, "xGA": 50, "PF": 25, "MP": 30, "W": 7, "D": 4, "L": 19 }
].sort(function(a,b){
  return a.PF < b.PF?1 : a.PF >= b.PF?-1:0
});

@Component({
  selector: 'app-mls-home',
  templateUrl: './mls-home.component.html',
  styleUrls: ['./mls-home.component.css']
})
export class MLSHomeComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['club', 'MP', 'W', 'D', 'L', 'GF', 'xGF', 'GA', 'xGA', 'GD', 'xGD', 'PF'];
  dataSource = new MatTableDataSource(CLUB_DATA);
  
  constructor() { }

  @ViewChild(MatSort) sort: MatSort = new MatSort();

  ngOnInit() { 
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}