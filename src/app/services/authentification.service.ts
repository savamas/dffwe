import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {map, tap} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {
  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
      return this.http.post<any>(
        `http://localhost:8080/Lab4IADBackEnd_Web_exploded/users/authenticate`,
        {username: username, password: password},
        httpOptions
      )
      .pipe(map(result => {
        if (result && result.token) {
          localStorage.setItem('currentUser', JSON.stringify(result));
        }
        return result;
      }));
  }

  logout() {
    localStorage.removeItem('currentUser');
  }
}
