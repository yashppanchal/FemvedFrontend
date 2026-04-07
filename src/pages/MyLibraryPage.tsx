import LibraryTab from "./user/LibraryTab";
import { usePageTitle } from "../usePageTitle";
import "./MyLibraryPage.scss";

export default function MyLibraryPage() {
  usePageTitle("My Library");

  return (
    <section className="page">
      <h1 className="page__title">My Library</h1>
      <LibraryTab />
    </section>
  );
}
