import { createApp } from "vue";
import "./index.css";
import { createRouter, createWebHistory } from "vue-router";
import { config } from "md-editor-v3";
import Notes from "./routes/Notes.vue";
import App from "./App.vue";
import PageNotFound from "./routes/PageNotFound.vue";
import Note from "./routes/Note.vue";

config({
  editorConfig: {
    renderDelay: 0,
  },
});

const routes = [
  { path: "/notes", component: Notes, props: true },
  { path: "/notes/:id", component: Note, props: true },
  { path: "/:pathMatch(.*)*", component: PageNotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(router);
app.mount("#app");
