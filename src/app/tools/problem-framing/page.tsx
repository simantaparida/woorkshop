import { redirect } from 'next/navigation';

/**
 * Problem Framing tool entry page
 * Redirects to the session creation page
 */
export default function ProblemFramingPage() {
  redirect('/tools/problem-framing/new');
}
