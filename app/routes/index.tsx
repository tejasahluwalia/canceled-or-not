import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <main className="container relative mx-auto min-h-screen bg-white px-4">
      <h1>Canceled or Not</h1>
      <form action="">
        <input type="text" className="border" />
        <button type="submit" className="border">
          Search
        </button>
      </form>
    </main>
  );
}
