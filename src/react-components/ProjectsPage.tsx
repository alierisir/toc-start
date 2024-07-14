import * as React from "react";
import * as Router from "react-router-dom";
import * as Firestore from "firebase/firestore"
import { ProjectsManager } from "../classes/ProjectsManager";
import { IProject, Project, Role, Status } from "../classes/Project";
import ProjectCard from "./ProjectCard";
import SearchBox from "./SearchBox";
import { getCollection } from "../firebase";

interface Props {
  projectsManager: ProjectsManager;
}

const ProjectsPage = ({ projectsManager }: Props) => {
  const [list, setList] = React.useState<Project[]>(projectsManager.list);


  const projectsCollection = getCollection<IProject>("/projects")

  projectsManager.onProjectCreated = () => {
    setList([...projectsManager.list]);
  };

  const getFirestoreProjects = async () => {
    // const projectsCollection = Firestore.collection(firebaseDB,"/projects") as Firestore.CollectionReference<IProject> // Firestore.CollectionReference kısmı sabit
    const firebaseProjects = await Firestore.getDocs(projectsCollection) // projelerin olduğu liste bu değil, liste docs özelliğinde tutuluyor
    const projectDocs = firebaseProjects.docs // tip: array, firestoreda bir üst methodda verilen parametreye göre yapılan arama sonucunun listesi
    for (const doc of projectDocs){ //her bir dokümana bu şekilde ulaşılıyor
      const data = doc.data() //her doküman içindeki verilere ulaşabilmek için data() methodu kullanılır.
      const projectData:IProject = {
        ...data,
        date: (data.date as unknown as Firestore.Timestamp).toDate()
      }
      try {
        projectsManager.newProject(projectData,doc.id) //collection methodu kullanılırken parametre olarak kullanılacak verinin tipi doğru belirtilmelidir!
      } catch (error) {
        const project = projectsManager.getProject(doc.id)
        if (!project) return
        project.edit(projectData)
      }
    }
  }

  React.useEffect(() => {
    getFirestoreProjects()
  }, []);

  const listProjects = list.map((project) => {
    return (
      <Router.Link to={`/project/${project.id}`} key={project.id + "link"}>
        <ProjectCard project={project} />
      </Router.Link>
    );
  });

  projectsManager.onListFiltered = (filtered) => {
    setList([...filtered]);
  };

  const onNewProjectClicked = () => {
    const modal = document.getElementById("new-project-modal") as HTMLDialogElement;
    modal.showModal();
  };

  const onCancelClicked = () => {
    const modal = document.getElementById("new-project-modal") as HTMLDialogElement;
    modal.close();
    const form = document.getElementById("new-project-form") as HTMLFormElement;
    form.reset();
  };

  const onFormSubmitted = async (e: React.FormEvent) => {
    const projectForm = document.getElementById("new-project-form") as HTMLFormElement;
    e.preventDefault();
    const formData = new FormData(projectForm);
    const date = new Date(formData.get("date") as string).toDateString() === "Invalid Date"
    ? new Date()
    : new Date(formData.get("date") as string);
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as Status,
      role: formData.get("role") as Role,
      date
    };
    try {
      const doc = await Firestore.addDoc(projectsCollection,projectData)
      projectsManager.newProject(projectData,doc.id);
      onCancelClicked();
    } catch (e) {
      throw new Error(`Error adding new project: ${e}`);
    }
  };

  const onImport = () => {
    projectsManager.importFromJSON();
  };

  const onExport = () => {
    projectsManager.exportToJSON();
  };

  return (
    <div id="projects-page" className="page">
      <dialog id="new-project-modal">
        <form
          id="new-project-form"
          className="modal-container"
          onSubmit={(e) => {
            onFormSubmitted(e);
          }}
        >
          <h2 className="modal-header">
            <span className="material-symbols-outlined">add_business</span>New Project
          </h2>
          <div className="project-properties">
            <label htmlFor="name">
              <span className="material-symbols-outlined">label</span>Name
            </label>
            <input type="text" name="name" id="name" placeholder="Name of the project" minLength={5} required={true} />
            <p className="modal-tips">TIP:Give it simple name</p>
          </div>
          <div className="project-properties">
            <label htmlFor="description">
              <span className="material-symbols-outlined">description</span>
              Description
            </label>
            <textarea
              name="description"
              id="description"
              cols={20}
              rows={5}
              placeholder="Describe your project (max:120 characters)"
              maxLength={120}
              defaultValue={""}
            />
          </div>
          <div className="project-properties">
            <label htmlFor="status">
              <span className="material-symbols-outlined">pending_actions</span>
              Status
            </label>
            <select name="status" id="status">
              <option value="active" defaultValue={"active"}>
                Active
              </option>
              <option value="pending">Pending</option>
              <option value="finished">Finished</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="role">
              <span className="material-symbols-outlined">school</span>Role
            </label>
            <select name="role" id="role">
              <option value="architect" defaultValue={"architect"}>
                Architect
              </option>
              <option value="engineer">Engineer</option>
              <option value="developer">Developer</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="date">
              <span className="material-symbols-outlined">event</span>Finishing Date
            </label>
            <input id="date-input" name="date" type="date" />
          </div>
          <div className="button-section">
            <button id="form-cancel" type="button" className="cancel-btn" onClick={onCancelClicked}>
              <span className="material-symbols-outlined">cancel</span>Cancel
            </button>
            <button type="submit" className="accept-btn">
              <span className="material-symbols-outlined">check_circle</span>
              Accept
            </button>
          </div>
        </form>
      </dialog>
      <header>
        <h2>Projects</h2>
        <SearchBox items="projects" onChange={(value) => projectsManager.filterProjects(value)} />
        <div className="button-section">
          <button id="import-from-json" onClick={onImport}>
            <span className="material-symbols-outlined">upload_2</span>
            Upload Projects
          </button>
          <button id="export-to-json" onClick={onExport}>
            <span className="material-symbols-outlined">download_2</span>
            Download Projects
          </button>
          <button id="new-project-btn" onClick={onNewProjectClicked}>
            <span className="material-symbols-outlined">add_business</span>New Project
          </button>
        </div>
      </header>
      <div id="projects-list">{listProjects.length === 0 ? <>Project was not found!</> : listProjects}</div>
    </div>
  );
};

export default ProjectsPage;
