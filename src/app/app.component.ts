import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from './user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  users: any[] = [];
  editedUser: any = null;
  userForm: FormGroup;
  experienceDetails: FormArray;
  countries = ['Country 1', 'Country 2', 'Country 3'];
  states: string[] = ['State 1', 'State 2', 'State 3'];
  cities: string[] = ['City 1', 'City 2', 'City 3'];
  years = ['1', '2', '3', '4', '5'];
  // editedUser: any = null;
  showCreateForm: boolean = false;

  constructor(private http: HttpClient,
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router) {
      this.userForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        firstName: ['', [Validators.required, Validators.maxLength(25), Validators.pattern('[a-zA-Z ]*')]],
        lastName: ['', [Validators.required, Validators.maxLength(25), Validators.pattern('[a-zA-Z ]*')]],
        mobileNo: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
        country: ['', Validators.required],
        state: ['', Validators.required],
        city: ['', Validators.required],
        English: [false],
        Hindi: [false],
        Gujarati: [false],
        experienceDetails: this.fb.array([])
      });
      this.experienceDetails = this.userForm.get('experienceDetails') as FormArray;
  
      this.route.params.subscribe(params => {
        const userId = params['id'];
        if (userId) {
          this.userService.getUserById(userId).subscribe(
            (userData) => {
              this.editedUser = userData;
              this.populateFormWithUserData();
            },
            (error) => {
              console.error('Error fetching user data:', error);
            }
          );
        }
      });
     }

  ngOnInit(): void {
    this.showCreateForm = false; 
    this.fetchUserData();
  }


    populateFormWithUserData() {
    this.userForm.patchValue({
      email: this.editedUser.email,
      password: this.editedUser.password,
      firstName: this.editedUser.firstName,
      lastName: this.editedUser.lastName,
      mobileNo: this.editedUser.mobileNo,
      country: this.editedUser.country,
      state: this.editedUser.state,
      city: this.editedUser.city,
      English: this.editedUser.English,
      Hindi: this.editedUser.Hindi,
      Gujarati: this.editedUser.Gujarati
    });
    this.editedUser.experienceDetails.forEach((experience: any) => {
      this.onAddExperience();
      const lastIndex = this.experienceDetails.length - 1;
      this.experienceDetails.at(lastIndex).patchValue(experience);
    });
  }

  onAddExperience() {
    this.experienceDetails.push(this.fb.group({
      years: ['', Validators.required],
      companyName: ['', Validators.required],
      jobDescription: ['', Validators.required]
    }));
  }



  onDeleteExperience(index: number) {
    this.experienceDetails.removeAt(index);
  }

  onSubmit() {
    if (this.userForm.valid) {
      if (this.editedUser) {
        this.updateUser();
      } else {
        this.createUser();
      }
    } else {
      console.log('Form is invalid');
    }
  }

  createUser() {
    this.userService.createUser(this.userForm.value).subscribe(
      (response) => {
        console.log('User created successfully:', response);
        this.userForm.reset();
        this.fetchUserData(); 
        this.showCreateForm = false;
      },
      (error) => {
        console.error('Error creating user:', error);
      }
    );
  }
  



  onReset() {
    this.userForm.reset();
    this.editedUser = null;
  }

  fetchUserData(): void {
    this.http.get<any[]>('http://localhost:3000/users').subscribe(
      (data) => {
        this.users = data.map(user => {
          user.experienceDetails = this.parseExperienceDetails(user.experienceDetails);
          return user;
        });
      },
      (error) => {
        console.error('Error fetching user data:', error);
      }
    );
  }

  parseExperienceDetails(details: string): any[] {
    console.log('Experience Details:', details);

    try {
      if (!details || details === 'null') {
        return [];
      }

      const cleanDetails = details.replace(/\\/g, '');

      if (cleanDetails.startsWith('[') && cleanDetails.endsWith(']')) {
        return JSON.parse(cleanDetails);
      } else {
        console.error('Invalid experience details format:', details);
        return [];
      }
    } catch (error) {
      console.error('Error parsing experience details:', error);
      return [];
    }
  }
  editUser(user: any): void {
    this.showCreateForm = true
    this.editedUser = { ...user };
  
    this.populateFormWithUserData();
  }
  
  

  updateUser(): void {
    // Make API call to update user data in the database
    this.http.put(`http://localhost:3000/users/${this.editedUser.id}`, this.editedUser).subscribe(
      (data) => {
        console.log('User updated successfully:', data);
          this.editedUser = null; 
        this.fetchUserData(); 
      },
      (error) => {
        console.error('Error updating user:', error);
      }
    );
  }

  deleteUser(user: any): void {
    const userId = user.id; 
    this.http.delete(`http://localhost:3000/users/${userId}`).subscribe(
      () => {
        console.log('User deleted successfully');
        this.fetchUserData(); 
      },
      (error) => {
        console.error('Error deleting user:', error);
      }
    );
  }
  

  Refresh(){
    window.location.reload()
  }
  
}
