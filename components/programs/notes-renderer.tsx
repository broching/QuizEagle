"use client";

type NoteSection = {
  sectionTitle: string;
  content: string;
  keyPoints: string[];
};

export function NotesRenderer({ notes }: { notes: string }) {
  let sections: NoteSection[] = [];
  try {
    sections = JSON.parse(notes) as NoteSection[];
  } catch {
    return (
      <div className="text-sm text-[#6A6F87] whitespace-pre-wrap leading-relaxed">{notes}</div>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map((section, i) => (
        <div key={i} className="space-y-3">
          <h3 className="text-base font-bold text-[#15172B] border-b border-[#ECEEF4] pb-2">
            {section.sectionTitle}
          </h3>
          <p className="text-sm text-[#34384F] leading-relaxed whitespace-pre-wrap">
            {section.content}
          </p>
          {section.keyPoints.length > 0 && (
            <div className="rounded-xl bg-[#EEF0FB] border border-[#C5CCEC] p-4">
              <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-wider mb-2">
                Key Points
              </p>
              <ul className="space-y-1.5">
                {section.keyPoints.map((point, j) => (
                  <li key={j} className="flex gap-2 text-sm text-[#34384F]">
                    <span className="text-[#5C6BC0] mt-0.5 shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
