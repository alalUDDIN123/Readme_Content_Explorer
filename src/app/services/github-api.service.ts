import { Injectable} from '@angular/core';
import { environment } from '../../environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GithubApiService {

  private baseUrl = environment.baseUrl; 

  constructor(private http: HttpClient) { }
  
  // get repository readme content
  getRepositoryReadmeContent(userEnteredData: any): Observable<any> {
    const url = `${this.baseUrl}/repos/${userEnteredData?.username}/${userEnteredData.repositoryName}/readme`;
    return this.http.get<any>(url);
  }

  // get repositories list

  getRepositories(gethubUsername:any) {
    const url = `${this.baseUrl}/users/${gethubUsername}/repos`;
    return this.http.get<any>(url);
  }
}
