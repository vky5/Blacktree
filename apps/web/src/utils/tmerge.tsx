import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS class names.
 * @param classes - List of class names to merge.
 * @returns A single merged class name string.
 */
export function tmerge(...classes: (string | undefined | null | false)[]) {
  return twMerge(classes.filter(Boolean).join(" "));
}