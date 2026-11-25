import type { Project } from "@/lib/content";
import { STORIES_PATH, storiesAvailable } from "@/lib/caltrain-stories";

type Link = Project["links"][number];

/**
 * A project's links as they should render: the Stories link is dropped while
 * the stories data is missing, so no page shows a link to a 404. Every place
 * that renders project links goes through this.
 */
export function visibleLinks(project: Pick<Project, "links">, storiesOn: boolean = storiesAvailable()): Link[] {
  return project.links.filter((l) => storiesOn || l.url !== STORIES_PATH);
}
