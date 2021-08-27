import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
    }
  }
`;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  loading: boolean = true;
  error: any;
  users: any;

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.apollo
      .watchQuery<any>({
        query: GET_USERS,
      })
      .valueChanges.subscribe((result: any) => {
        console.log(result.error);
        this.users = result?.data?.users;
        this.loading = result.loading;
        this.error = result.error;
      });
  }
}
