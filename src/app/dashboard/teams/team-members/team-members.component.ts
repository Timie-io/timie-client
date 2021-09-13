import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRef } from 'apollo-angular';
import { User } from '../../../_models/user.model';
import { TeamMembersResponse } from '../graphql/teams-query.graphql';
import {
  AllUsersQueryGQL,
  AllUsersResponse,
} from './../../../_services/graphql/users-query.graphql';
import {
  AddTeamMemberGQL,
  RemoveTeamMemberGQL,
} from './../graphql/teams-mutation.graphql';
import { TeamMembersGQL } from './../graphql/teams-query.graphql';

@Component({
  selector: 'app-team-members',
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.css'],
})
export class TeamMembersComponent implements OnInit {
  @Input() id?: string;
  @Input() name?: string;

  filter: string = '';

  private usersQuery: QueryRef<AllUsersResponse>;
  private membersQuery?: QueryRef<TeamMembersResponse>;

  allUsers: User[] = [];
  members: User[] = [];

  constructor(
    public modal: NgbActiveModal,
    private readonly teamMembersGQL: TeamMembersGQL,
    private readonly addTeamMemberGQL: AddTeamMemberGQL,
    private readonly removeTeamMemberGQL: RemoveTeamMemberGQL,
    private readonly allUsersQueryGQL: AllUsersQueryGQL
  ) {
    this.usersQuery = this.allUsersQueryGQL.watch();
  }

  ngOnInit(): void {
    this.membersQuery = this.teamMembersGQL.watch({
      id: this.id,
    });
    this.membersQuery.valueChanges.subscribe(({ data }) => {
      this.members = data.team.members;
    });
    this.updateUsersList();
  }

  private updateUsersList() {
    this.usersQuery.valueChanges.subscribe(({ data }) => {
      this.allUsers = data.users;
    });
  }

  get users(): User[] {
    const output: User[] = [];
    for (let user of this.allUsers) {
      if (this.members.find((m) => m.id === user.id)) {
        continue;
      }
      if (
        this.filter &&
        !(user.name.includes(this.filter) || user.email.includes(this.filter))
      ) {
        continue;
      }
      output.push(user);
    }
    return output;
  }

  addMember(member: User) {
    this.addTeamMemberGQL
      .mutate(
        { userId: member.id, teamId: this.id },
        {
          refetchQueries: [
            {
              query: this.teamMembersGQL.document,
              variables: { id: this.id },
            },
          ],
        }
      )
      .subscribe();
  }

  removeMember(member: User) {
    this.removeTeamMemberGQL
      .mutate(
        { userId: member.id, teamId: this.id },
        {
          refetchQueries: [
            {
              query: this.teamMembersGQL.document,
              variables: { id: this.id },
            },
          ],
        }
      )
      .subscribe();
  }
}
