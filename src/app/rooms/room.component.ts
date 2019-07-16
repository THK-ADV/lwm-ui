import { Component, OnInit } from '@angular/core';
import { RoomService } from '../services/room.service';
import { Room } from '../models/room.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  private rooms: Room[] = [];
  private roomSub: Subscription

  constructor(private roomService: RoomService) { }

  ngOnInit() {
    this.roomSub = this.roomService.getRooms().subscribe(rooms => 
      this.rooms = rooms.sort((a, b) => (a.label < b.label ? 0: 1))
    )
  }

  ngOnDestroy(): void {
    this.roomSub.unsubscribe()
}
}
