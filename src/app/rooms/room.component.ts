import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { RoomService } from '../services/room.service';
import { Room } from '../models/room.model';
import { NgbdSortableHeader, SortEvent, compare } from '../directives/ngbd-sortable-header.directive';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  private roomSub: Subscription
  private rooms: Room[]
  private roomsSorted: Room[]

  constructor(private roomService: RoomService) { }

  ngOnInit() {
    this.roomSub = this.roomService.getRooms().subscribe(rooms => {
      this.rooms = rooms
      this.roomsSorted = rooms
      this.onSort({ column: 'label', direction: 'asc' })
    })
  }

  ngOnDestroy(): void {
    this.roomSub.unsubscribe()
  }

  onSort({ column, direction }: SortEvent) {
    console.log(column, direction)

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    //sorting countries
    if (direction === '') {
      this.roomsSorted = this.rooms;
    } else {
      this.roomsSorted = [...this.rooms].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }

  }
}
