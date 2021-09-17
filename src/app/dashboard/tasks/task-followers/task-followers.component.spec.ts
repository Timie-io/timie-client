import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFollowersComponent } from './task-followers.component';

describe('TaskFollowersComponent', () => {
  let component: TaskFollowersComponent;
  let fixture: ComponentFixture<TaskFollowersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskFollowersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskFollowersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
