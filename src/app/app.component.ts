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
  isContentDisplayed: boolean = false
  isReadmeContent: boolean = true
  repositories: any[] = [];


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
        this.readmeContent = readmeContent
        this.isContentDisplayed = true
        this.isLoading = false;
        this.resetForm();
      },
      error => {
        this.isLoading = false;
        this.handleError(error);
      }
    );
  }

  // show get readme content form fn
  ShowReadMe() {
    this.isReadmeContent = true
    this.repositories = []
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

  showBtnClick() {
    this.isContentDisplayed = false
  }

  ShowReposForm() {
    this.isReadmeContent = false
  }
  // get list or the repositoris which are public

  fetchPublicRepositoriestList() {
    if (!this.username) {
      alert("Please enter github username .");
      return;
    }
    this.isLoading = true;
    this.githubApiService.getRepositories(this.username).subscribe(
      repositories => {
        // console.log("repositories list ",repositories);
        if (repositories.length === 0) {
          this.errorMessage = "No repository found"

          setTimeout(() => {
            this.errorMessage = "";
          }, 1500);
        }
        this.repositories = repositories;
        this.isLoading = false;

      },
      error => {
        this.isLoading = false;
        console.log('Error fetching repositories:', error);
        this.handleError(error)
      }
    );
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
    }, 1500);

  }

  redirectToRepository(repository: any) {
    window.open(repository.html_url, '_blank');
  }
  

}
