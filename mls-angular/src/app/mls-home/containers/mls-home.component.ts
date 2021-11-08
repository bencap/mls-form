import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ClubService } from 'src/app/services/club.service';
import { FixtureService } from 'src/app/services/fixture.service';

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

@Component({
  selector: 'app-mls-home',
  templateUrl: './mls-home.component.html',
  styleUrls: ['./mls-home.component.css']
})
export class MLSHomeComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['club', 'MP', 'W', 'D', 'L', 'GF', 'xGF', 'GA', 'xGA', 'GD', 'xGD', 'PF'];
  dataSource = new MatTableDataSource<Club>([]);

  constructor(private clubService: ClubService) { }

  @ViewChild(MatSort) sort: MatSort = new MatSort();

  ngOnInit() { 
    this.getClubs();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  getClubs(): void {
    this.clubService.getClubs()
      .subscribe(clubs => (this.dataSource.data = clubs
        .sort(function (a, b) 
          {
            return a.PF < b.PF ? 1 : a.PF >= b.PF ? -1 : 0
          }
        )
      ));
  }
}