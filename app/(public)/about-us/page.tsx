import { permanentRedirect } from 'next/navigation';

export default function AboutUsRedirectPage() {
  permanentRedirect('/about');
}
