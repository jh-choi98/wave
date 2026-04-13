# WAVE — User Flows

## Flow 1: Entry / Auth

```
App access
├── [Not logged in]
│   └── Landing page (app intro + Google login button)
│       └── Google OAuth
│           ├── New user → DB create → Home + first-visit banner
│           └── Existing user → Home
└── [Logged in]
    └── Home
```

First-visit banner: "첫 번째 본문은 창세기 1장입니다" — X로 닫기, 재표시 없음.

## Flow 2: Home — Before Meditation

```
Home
├── Header: date + profile icon (→ logout dropdown)
├── Passage header: book+chapter + [변경] button
├── Bible text (independent scroll, verse numbers shown)
└── Meditation textarea (fixed bottom)
    │  Typing → localStorage draft auto-save
    └── [저장] → DB save → toast "저장되었습니다" + completion badge
```

## Flow 3: Home — After Meditation

```
Home
├── Completion badge shown
├── Today's passage (same chapter maintained)
└── Today's meditation (editable)
    └── Edit + [저장] → overwrite → toast
    └── Next day access → auto-advance to next chapter
```

## Flow 4: Passage Selection

```
[변경] tap → Bottom sheet
├── [구약] / [신약] tabs
├── Book list
└── Book tap → Chapter grid
    └── Chapter tap → sheet closes → passage replaced immediately
```

No confirm button. Chapter selection is instant.

## Flow 5: Passage Change with Existing Save

Today's meditation already saved (Genesis 3) → user selects John 1:
- Passage changes, meditation content preserved.
- Re-save → overwrites with John 1.
- No confirmation dialog.

## Flow 6: Draft Lifecycle

```
Typing → localStorage auto-save { book, chapter, content }
Tab switch → draft preserved
Return to home → draft restored (no notification)
[저장] complete → draft deleted
Date change → draft deleted (yesterday's discarded)
```

## Flow 7: Records Tab

```
Records tab
├── [No records] → "아직 묵상 기록이 없어요. 홈에서 첫 묵상을 작성해보세요."
└── Meditation list (newest first)
    └── Each item: date | book+chapter | first line preview
        └── Tap → inline expand
            ├── Full content
            ├── Created date (+ modified date if edited)
            └── [수정] button
                └── Edit mode → [저장] / [취소]
                    └── Save → updated_at refreshed
```

## Common States

| State | Behavior |
|-------|----------|
| Loading | Skeleton UI |
| Saving | Button disabled + spinner |
| Save complete | Toast notification |
| API failure | "본문을 불러오지 못했습니다" + [재시도] |
| Mobile keyboard | Bible text area minimized, textarea gets full space |
