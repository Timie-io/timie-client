import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAssignmentModalComponent } from './task-assignment-modal.component';

describe('TaskAssignmentModalComponent', () => {
  let component: TaskAssignmentModalComponent;
  let fixture: ComponentFixture<TaskAssignmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskAssignmentModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskAssignmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
