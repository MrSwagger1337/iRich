# Editorial Components Manual Verification Checklist

> Status: **NOT TESTED BY HUMAN**

---

## Verification Matrix

- [ ] **1. Section**: Renders background variants (`default`, `muted`, `accent`) and vertical spacing.
- [ ] **2. Columns**: 2-column layout renders equal, start-narrow, and end-narrow proportions.
- [ ] **3. Mobile Columns Stacking**: Columns collapse gracefully into a single vertical stack below 768px.
- [ ] **4. Image**: Renders responsive figure with preserve aspect ratio.
- [ ] **5. Caption**: Caption and photo credit display in `<figcaption>` below the image.
- [ ] **6. Alt Behavior**: Alt text renders in `<img>` element.
- [ ] **7. Callout**: Renders contextual aside with proper icon and surface tint.
- [ ] **8. Callout Variants**: Info (blue), Insight (purple), Warning (amber), Success (green) styles apply.
- [ ] **9. Quote**: Semantic `<blockquote>` renders quotation text with attribution and source.
- [ ] **10. Arabic Quote**: Arabic pull quote displays properly in RTL with correct border and margin.
- [ ] **11. KeyTakeaway**: Distinct from Callout, displays badge and highlighted summary framing.
- [ ] **12. Card**: Compositional card displays nested heading, text, image, and buttons.
- [ ] **13. CardGrid**: Displays 2, 3, or 4 columns on desktop.
- [ ] **14. Invalid CardGrid Child Rejected**: Dropping or pasting a non-Card component into CardGrid fails validation.
- [ ] **15. Button**: Rendered as semantic `<a>` link navigation element.
- [ ] **16. CTA**: Promotional call-to-action region renders centered with action button.
- [ ] **17. Button Link Behavior**: Clicking button link navigates to target URL.
- [ ] **18. Unsafe URL Rejected**: `javascript:` or unsafe protocols are rejected by validator and sanitized by renderer.
- [ ] **19. Inspector Variants**: Changing variant select in Inspector live-updates component appearance.
- [ ] **20. Inspector Image Fields**: Editing src, alt, caption, credit in Inspector updates figure immediately.
- [ ] **21. DnD into Valid Container**: Dragging blocks into Section or Card functions as expected.
- [ ] **22. Invalid DnD Rejected**: Dragging Column outside Columns shows invalid drop indicator.
- [ ] **23. Duplicate Editorial Block**: Duplicating a Section or Card clones the subtree with new IDs.
- [ ] **24. Delete Editorial Block**: Deleting an editorial component removes it cleanly from document tree.
- [ ] **25. Undo**: Undoing any mutation restores previous document state.
- [ ] **26. Redo**: Redoing re-applies the mutation.
- [ ] **27. English Article**: English editorial article fixture renders with proper typography and rhythm.
- [ ] **28. Arabic Article**: Arabic editorial article fixture renders with proper RTL alignment.
- [ ] **29. Mixed Direction**: LTR quotes/code inside Arabic article render with correct directionality.
- [ ] **30. Desktop / Tablet / Mobile Viewports**: Responsive toolbar switches layout cleanly across viewports.
- [ ] **31. Published Renderer**: Published view renders identically with pure React renderers.
- [ ] **32. External AI Roundtrip**: Copying AI Context into an external LLM, requesting a redesign, and pasting returned JSON validates and applies cleanly.
