import { useActiveSection } from "../hooks/useActiveSection";
import useKeyboardNav from "../hooks/useKeyboardNav";

/**
 * Tiny helper that lives INSIDE the ActiveSectionProvider so it can read
 * the current section index and feed it to the keyboard-nav hook.
 */
export default function KeyboardNavBridge() {
  const { index } = useActiveSection();
  useKeyboardNav(index);
  return null;
}
