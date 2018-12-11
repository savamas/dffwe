import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from '../models/user';
import {Hit} from '../models/hit';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable()
export class UserService {

  hit: Hit;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Hit[]>(`http://localhost:8080/Lab4IADBackEnd_Web_exploded/users/hits`);
  }
/*
  getById(id: number) {
    return this.http.get(`http:/localhost:8080/Lab_IAD_4/users/` + id);
  }
*/
  register(user: User) {
    return this.http.post(`http://localhost:8080/Lab4IADBackEnd_Web_exploded/users/register`, user, httpOptions);
  }

  checkHit(x: number, y: number, r: number) {
    this.hit = new Hit();
    this.hit.x = x;
    this.hit.y = y;
    this.hit.r = r;
    this.hit.isInArea = '';
    return this.http.post(`http://localhost:8080/Lab4IADBackEnd_Web_exploded/users/check`, this.hit, httpOptions);
  }

/*
  update(user: User) {
    return this.http.put(`http:/localhost:8080/Lab_IAD_4/users/` + user.id, user);
  }
*/

  delete(id: number) {
    return this.http.delete(`http:/localhost:8080/Lab_IAD_4/users/` + id);
  }
}
