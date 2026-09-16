import os
import re

path = 'src/pages/AddTrade.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace("const [academySource, setAcademySource] = useState<string | null>(null);", "const [academySource, setAcademySource] = useState<string | null>(null);\n  const [isSubmitting, setIsSubmitting] = useState(false);")

handle_submit = """  const handleSubmit = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
"""

content = content.replace("  const handleSubmit = async (e: React.FormEvent, addAnother = false) => {\n    e.preventDefault();", handle_submit)

content = content.replace("setShowToast(true);", "setShowToast(true);\n      setIsSubmitting(false);")
content = content.replace("setTimeout(() => setShowToast(false), 3000);", "setTimeout(() => setShowToast(false), 3000);")
content = content.replace("} catch (error) {\n      console.error('Failed to save trade:', error);\n      alert(error instanceof Error ? error.message : 'Failed to save trade');\n    }", "} catch (error) {\n      console.error('Failed to save trade:', error);\n      alert(error instanceof Error ? error.message : 'Failed to save trade');\n      setIsSubmitting(false);\n    }")

content = content.replace("disabled={!formData.market || !formData.entry}", "disabled={isSubmitting || !formData.market || !formData.entry}")
content = content.replace('<Button type="submit" size="lg" className="w-full sm:w-auto min-w-[160px]">', '<Button type="submit" size="lg" disabled={isSubmitting || !formData.market || !formData.entry} className="w-full sm:w-auto min-w-[160px]">')

with open(path, 'w') as f:
    f.write(content)

print("AddTrade fixed")
