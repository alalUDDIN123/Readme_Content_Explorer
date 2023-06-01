import { Component } from '@angular/core';
import { GithubApiService } from './services/github-api.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = "Github Repository Readme content";
  readmeContent: string = '';
  isLoading: boolean = false;
  readmeSteps: { title: string, link: string }[] = [];
  errorMessage: string = '';
  username: string = '';
  repositoryName: string = '';
  ShowUsername: string = '';
  ShowrepositoryName: string = '';
  isContentDisplayed: boolean = false
  isReadmeContent: boolean = true
  repositories: any[] = [];
  filteredRepositories: any[] = [];


  resetForm() {
    this.username = '';
    this.repositoryName = '';
  }


  constructor(
    private githubApiService: GithubApiService,
  ) { }

  fetchRepositoryReadmeContent() {
    if (!this.username || !this.repositoryName) {
      alert("Please enter both username and repository name.");
      return;
    }

    const userRepositoryData = {
      username: this.username,
      repositoryName: this.repositoryName
    };

    this.isLoading = true;
    this.errorMessage = '';

    this.githubApiService.getRepositoryReadmeContent(userRepositoryData).subscribe(
      readme => {
        const readmeContent = atob(readme.content);
        // console.log("readme content",readmeContent);
        if (readmeContent) {
          this.readmeContent = readmeContent
          this.isContentDisplayed = true
          this.isLoading = false;
          this.ShowUsername = userRepositoryData.username;
          this.ShowrepositoryName = userRepositoryData.repositoryName;
          this.resetForm();
        } else {
          this.errorMessage = "Content could not found";
          this.isLoading = false;
          this.resetForm();
          setTimeout(() => {
            this.errorMessage = "";
          }, 2500);
        }

      },
      error => {
        this.isLoading = false;
        this.handleError(error);
      }
    );
  }



  parseReadmeContentWithLinks() {
    if (!this.readmeContent) {
      return '';
    }

    // Remove unwanted syntax
    const cleanedContent = this.readmeContent
      .replace(/---+/g, '') // Remove horizontal lines
      .replace(/`+/g, '') // Remove code blocks
      .replace(/(\d+\.\s+)?[-•]\s+/g, ''); // Remove bullet points and numbering

    // Convert URLs to clickable links
    const contentWithLinks = cleanedContent.replace(
      /(\[([^\]]+)\]\((https?:\/\/[^\)]+)\))/g,
      '<a href="$3" target="_blank">$2</a>'
    );

    // Apply HTML tags to unwanted syntax sections
    const formattedContent = contentWithLinks.replace(
      /(\*\*([^*]+)\*\*)/g,
      '<strong>$2</strong>'
    ).replace(
      /(#+)\s*(.*)/g,
      (_, hash, text) => `<h${hash.length}>${text}</h${hash.length}>`
    );

    return formattedContent;
  }


  // show get readme content form fn
  ShowReadMe() {
    this.isReadmeContent = true
    this.repositories = []
  }


  showBtnClick() {
    this.isContentDisplayed = false
  }

  ShowReposForm() {
    this.isReadmeContent = false
  }
  // get list or the repositoris which are public

  fetchPublicRepositoriesList() {
    if (!this.username) {
      alert("Please enter github username.");
      return;
    }
    this.isLoading = true;
    this.ShowUsername = this.username;

    this.githubApiService.getRepositories(this.username).subscribe(
      repositories => {
        if (repositories.length === 0) {
          this.errorMessage = "No repository found";
          setTimeout(() => {
            this.errorMessage = "";
          }, 2500);
        }
        this.repositories = repositories;
        this.filteredRepositories = repositories;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        // console.log('Error fetching repositories:', error);
        this.handleError(error);
      }
    );
  }


  searchRepositories(event: any) {
    let searchTerm = event.target?.value
    if (!searchTerm) {
      this.filteredRepositories = this.repositories;
    } else {
      this.filteredRepositories = this.repositories.filter(repository =>
        repository.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    }
  }


  handleError(error: any) {
    // console.log("error.status",error.status,error.message);

    if (error.status === 400) {
      this.errorMessage = "You have sent an invalid request. Please do not send this request again.";
    } else if (error.status === 404) {
      this.errorMessage = "User or repository not found";
    } else {
      this.errorMessage = "Error fetching README file content";
    }


    setTimeout(() => {
      this.errorMessage = "";
    }, 2500);

  }

  redirectToRepository(repository: any) {
    window.open(repository.html_url, '_blank');
  }


}
