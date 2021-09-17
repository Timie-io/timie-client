import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAssignmentsComponent } from './task-assignments.component';

describe('TaskAssignmentsComponent', () => {
  let component: TaskAssignmentsComponent;
  let fixture: ComponentFixture<TaskAssignmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskAssignmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskAssignmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
