import { gql, Subscription } from 'apollo-angular';
import { Entry } from './../../_models/entry.model';

export interface EntryChangedInput {
  assignmentId: string;
}

export interface EntryAddedResponse {
  entryAdded: Entry;
}

export interface EntryRemovedResponse {
  entryRemoved: Entry;
}

export interface EntryStartedResponse {
  entryStarted: Entry;
}

export interface EntryStoppedResponse {
  entryStopped: Entry;
}

export class EntryAddedGQL extends Subscription<EntryAddedResponse> {
  document = gql`
    subscription EntryAdded($input: EntryChangedInput) {
      entryAdded(input: $input) {
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

export class EntryRemovedGQL extends Subscription<EntryRemovedResponse> {
  document = gql`
    subscription EntryRemoved($input: EntryChangedInput) {
      entryRemoved(input: $input) {
        id
      }
    }
  `;
}

export class EntryStartedGQL extends Subscription<EntryStartedResponse> {
  document = gql`
    subscription EntryStarted($input: EntryChangedInput) {
      entryStarted(input: $input) {
        id
        startTime
        finishTime
      }
    }
  `;
}

export class EntryStoppedGQL extends Subscription<EntryStoppedResponse> {
  document = gql`
    subscription EntryStopped($input: EntryChangedInput) {
      entryStopped(input: $input) {
        id
        startTime
        finishTime
      }
    }
  `;
}
