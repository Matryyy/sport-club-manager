import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Member } from '../../member.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private members: Member[] = [
    { id: '1', name: 'Jaromír Jágr' },
    { id: '2', name: 'Dominik Hašek' },
    { id: '3', name: 'Tomáš Satoranský' },
    { id: '4', name: 'Ester Ledecká' },
    { id: '5', name: 'Petra Kvitová' },
    { id: '6', name: 'David Pastrňák' },
    { id: '7', name: 'Ondřej Palát' },
    { id: '8', name: 'Jakub Voráček' },
    { id: '9', name: 'Patrik Schick' },
    { id: '10', name: 'Martina Sáblíková' },
  ];

  private members$ = new BehaviorSubject<Member[]>(this.members);

  getAvailableMembers(): Observable<Member[]> {
    return this.members$.asObservable();
  }

  getMemberById(id: string): Member | undefined {
    return this.members.find(m => m.id === id);
  }
}
