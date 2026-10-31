import Icon from '../components/Icon';
import { Link } from '../lib/router';

export default function NotFound() {
  return (
    <main className="container page-pad notfound">
      <p className="eyebrow">404</p>
      <h1>Page not <em>found.</em></h1>
      <p>The page you’re looking for doesn’t exist — but the right property might.</p>
      <div className="notfound-actions">
        <Link className="button" to="/buy">Properties for sale <Icon id="arrow" /></Link>
        <Link className="button button-dark" to="/rent">Properties for rent <Icon id="arrow" /></Link>
      </div>
    </main>
  );
}
