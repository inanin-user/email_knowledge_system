# Key Questions feature

Files in this bundle:
- `lib/casePrompts.ts`: fetches prompts from `GET /api/email-cases/[id]`, using your existing `withBasePath()` helper.
- `lib/extractQuestionTitle.ts`: derives a short question title without modifying the full prompt.
- `components/PromptDetailPopup.tsx`: popup with full prompt text and copy action.
- `components/KeyQuestionsDropdown.tsx`: dropdown list and popup orchestration.

## Integration

1. Copy the `lib` and `components` files into the matching folders in your Next.js project.
2. Ensure `GET /api/email-cases/[id]` returns `prompts: [{ id, case_id, body }]`. The existing endpoint was previously set up to return this.
3. Import the component into the client component that renders the selected case's right panel:

```tsx
import KeyQuestionsDropdown from "@/components/KeyQuestionsDropdown";
import type { TroubleshootingPrompt } from "@/lib/casePrompts";
```

4. Place it immediately below the right-panel header:

```tsx
<KeyQuestionsDropdown
  caseId={selectedCase?.id ?? null}
  prompts={selectedCase?.prompts as TroubleshootingPrompt[] | undefined}
/>
```

If your `selectedCase` is already strongly typed with a `prompts` field, you can omit the cast and just pass `prompts={selectedCase?.prompts}`.

The component can fetch prompts itself if `prompts` is omitted. It resets the selected prompt when the case changes.

## Notes

- This assumes your alias `@/*` maps to the project root, as in a typical Next.js setup.
- It assumes `lib/basePath.ts` exports `withBasePath()`.
- The title extractor is heuristic; it does not call an LLM. Review the extracted titles against real saved prompts before using them as canonical titles.
