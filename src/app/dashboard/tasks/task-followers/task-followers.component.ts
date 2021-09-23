import { Component, Input, OnInit } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import {
  AddTaskFollowerGQL,
  RemoveTaskFollowerGQL,
} from '../../../_services/graphql/tasks-mutation.graphql';
import {
  TaskFollowersGQL,
  TaskFollowersResponse,
} from '../../../_services/graphql/tasks-query.graphql';
import { User } from './../../../_models/user.model';
import {
  AllUsersQueryGQL,
  AllUsersResponse,
} from './../../../_services/graphql/users-query.graphql';

@Component({
  selector: 'app-task-followers',
  templateUrl: './task-followers.component.html',
  styleUrls: ['./task-followers.component.css'],
})
export class TaskFollowersComponent implements OnInit {
  @Input() taskId: string | null = null;

  filter = '';

  allUsers: User[] = [];
  followers: User[] = [];

  private usersQuery: QueryRef<AllUsersResponse>;
  private followersQuery?: QueryRef<TaskFollowersResponse>;

  constructor(
    private readonly allUsersGQL: AllUsersQueryGQL,
    private readonly taskFollowersGQL: TaskFollowersGQL,
    private readonly addFollowerGQL: AddTaskFollowerGQL,
    private readonly removeFollowerGQL: RemoveTaskFollowerGQL
  ) {
    this.usersQuery = this.allUsersGQL.watch();
  }

  ngOnInit(): void {
    if (!this.taskId) {
      return;
    }
    this.followersQuery = this.taskFollowersGQL.watch({ id: this.taskId });
    this.followersQuery.valueChanges.subscribe(({ data }) => {
      this.followers = data.task.followers;
    });
    this.usersQuery.valueChanges.subscribe(({ data }) => {
      this.allUsers = data.users;
    });
  }

  get users(): User[] {
    const output: User[] = [];
    for (let user of this.allUsers) {
      if (this.followers.find((m) => m.id === user.id)) {
        continue;
      }
      if (
        this.filter &&
        !(
          user.name.toLowerCase().includes(this.filter.toLowerCase()) ||
          user.email.includes(this.filter)
        )
      ) {
        continue;
      }
      output.push(user);
    }
    return output;
  }

  addFollower(user: User) {
    this.addFollowerGQL
      .mutate(
        { userId: user.id, id: this.taskId },
        {
          refetchQueries: [
            {
              query: this.taskFollowersGQL.document,
              variables: { id: this.taskId },
            },
          ],
        }
      )
      .subscribe();
  }

  removeFollower(user: User) {
    this.removeFollowerGQL
      .mutate(
        { userId: user.id, id: this.taskId },
        {
          refetchQueries: [
            {
              query: this.taskFollowersGQL.document,
              variables: { id: this.taskId },
            },
          ],
        }
      )
      .subscribe();
  }
}
