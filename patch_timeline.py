import os

path = 'src/pages/NewsIntelligence.tsx'
with open(path, 'r') as f:
    content = f.read()

import_timeline = "import { EventTimeline } from '@/components/news/EventTimeline';\n"
if 'EventTimeline' not in content:
    content = content.replace("import { VisualNewsArticleModal }", import_timeline + "import { VisualNewsArticleModal }")

timeline_section = """
            {/* EVENT TIMELINE */}
            <section>
              <EventTimeline events={NEWS_EVENTS} />
            </section>

"""

if 'EventTimeline events=' not in content:
    content = content.replace("{/* FULL NEWS FEED */}", timeline_section + "            {/* FULL NEWS FEED */}")

with open(path, 'w') as f:
    f.write(content)

print("Added EventTimeline")
