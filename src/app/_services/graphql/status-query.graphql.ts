import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { Status } from './../../_models/status.model';

export interface StatusOptionsResponse {
  statuses: Status[];
}

@Injectable({
  providedIn: 'root',
})
export class StatusOptionsGQL extends Query<StatusOptionsResponse> {
  document = gql`
    query GetAllStatus {
      statuses {
        code
        order
        label
      }
    }
  `;
}
