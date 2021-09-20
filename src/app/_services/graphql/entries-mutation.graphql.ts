import { Injectable } from '@angular/core';
import { gql, Mutation } from 'apollo-angular';
import { Entry } from './../../_models/entry.model';

export interface UpdateEntryResponse {
  updateEntry: Entry;
}

export interface CreateEntryResponse {
  createEntry: Entry;
}

export interface RemoveEntryResponse {
  removeEntry: Entry;
}

export interface StartEntryResponse {
  startEntry: Entry;
}

export interface StopEntryResponse {
  stopEntry: Entry;
}

export interface UpdateEntryInput {
  startTime?: string;
  finishTime?: string;
}

export interface NewEntryInput {
  startTime?: string;
  finishTime?: string;
  assignmentId: string;
}

@Injectable({
  providedIn: 'root',
})
export class CreateEntryGQL extends Mutation<CreateEntryResponse> {
  document = gql`
    mutation CreateEntry($data: NewEntryInput!) {
      createEntry(data: $data) {
        id
        startTime
        finishTime
        assignment {
          id
        }
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateEntryGQL extends Mutation<UpdateEntryResponse> {
  document = gql`
    mutation UpdateEntry($id: ID!, $data: UpdateEntryInput!) {
      updateEntry(id: $id, data: $data) {
        id
        startTime
        finishTime
        assignment {
          id
        }
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class RemoveEntryGQL extends Mutation<RemoveEntryResponse> {
  document = gql`
    mutation RemoveEntry($id: ID!) {
      removeEntry(id: $id) {
        id
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class StartEntryGQL extends Mutation<StartEntryResponse> {
  document = gql`
    mutation StartEntry($id: ID!) {
      startEntry(id: $id) {
        id
        startTime
        finishTime
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class StopEntryGQL extends Mutation<StopEntryResponse> {
  document = gql`
    mutation StopEntry($id: ID!) {
      stopEntry(id: $id) {
        id
        startTime
        finishTime
      }
    }
  `;
}
