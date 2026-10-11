import { Header } from "./components/Header";
import { Panel } from "./components/Panel";

export function App(): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10">
      <Header />
      <main>
        <Panel />
      </main>
    </div>
  );
}
