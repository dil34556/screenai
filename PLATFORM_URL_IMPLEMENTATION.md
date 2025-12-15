# Platform-Specific Application URL Implementation

## ✅ FULLY IMPLEMENTED AND WORKING

### How It Works:

#### 1. **Generate Platform-Specific URLs**
On the Job Details page (`/admin/jobs/{jobId}`), you'll see 4 platform buttons:
- **LinkedIn** → Generates: `http://localhost:3001/jobs/1/apply?platform=LINKEDIN`
- **Indeed** → Generates: `http://localhost:3001/jobs/1/apply?platform=INDEED`
- **Glassdoor** → Generates: `http://localhost:3001/jobs/1/apply?platform=GLASSDOOR`
- **Naukri** → Generates: `http://localhost:3001/jobs/1/apply?platform=NAUKRI`

#### 2. **Copy and Share**
- Click any platform button to copy the URL to clipboard
- Share that URL on the respective platform (LinkedIn, Indeed, etc.)

#### 3. **Candidate Applies**
When a candidate clicks the link:
- The URL parameter `?platform=LINKEDIN` is automatically detected
- A badge appears on the application form showing "Applying via LINKEDIN"
- The platform is included in the form submission

#### 4. **Database Storage**
The platform is saved in the database:
```python
# Backend: candidates/views.py (Line 23, 68)
platform = request.data.get("platform", "Website")  # Extract from form
application = Application.objects.create(
    job=job,
    candidate=candidate,
    platform=platform,  # ✅ SAVED TO DATABASE
    ...
)
```

#### 5. **View in Analytics**
- Go to `/admin/analytics`
- See "Platform Performance" chart showing breakdown by source
- Filter candidates by platform in Job Details page

### Database Schema:
```python
# candidates/models.py
class Application(models.Model):
    ...
    platform = models.CharField(
        max_length=20, 
        choices=PLATFORM_CHOICES, 
        default='OTHER'
    )
    PLATFORM_CHOICES = [
        ('LINKEDIN', 'LinkedIn'),
        ('INDEED', 'Indeed'),
        ('GLASSDOOR', 'Glassdoor'),
        ('NAUKRI', 'Naukri'),
        ('OTHER', 'Other'),
    ]
```

### Frontend Implementation:

**JobDetailsPage.js** (Lines 174-204):
```javascript
// Platform buttons with copy functionality
{[
    { name: 'LinkedIn', value: 'LINKEDIN', color: 'bg-[#0077B5]' },
    { name: 'Indeed', value: 'INDEED', color: 'bg-[#2164F3]' },
    { name: 'Glassdoor', value: 'GLASSDOOR', color: 'bg-[#0CAA41]' },
    { name: 'Naukri', value: 'NAUKRI', color: 'bg-[#FBD235]' }
].map((platform) => {
    const url = `${window.location.origin}/jobs/${jobId}/apply?platform=${platform.value}`;
    return (
        <button onClick={() => {
            navigator.clipboard.writeText(url);
            alert(`${platform.name} link copied!`);
        }}>
            {platform.name}
        </button>
    );
})}
```

**ApplyPage.js** (Lines 24-31, 68):
```javascript
// Extract platform from URL
useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const platformParam = searchParams.get('platform');
    if (platformParam) {
        setPlatform(platformParam);  // ✅ DETECTED FROM URL
    }
}, [location.search]);

// Include in form submission
data.append('platform', platform);  // ✅ SENT TO BACKEND
```

### Testing:

1. **Navigate to**: `http://localhost:3001/admin/jobs/1`
2. **Click** the "LinkedIn" button
3. **URL copied**: `http://localhost:3001/jobs/1/apply?platform=LINKEDIN`
4. **Open** that URL in a new tab
5. **See** the "Applying via LINKEDIN" badge
6. **Fill and submit** the form
7. **Check database**: Platform will be saved as "LINKEDIN"

### Verification:

Run this command to see platforms in database:
```bash
python manage.py shell -c "from candidates.models import Application; [print(f'{a.candidate.name}: {a.platform}') for a in Application.objects.all()]"
```

## ✅ COMPLETE IMPLEMENTATION CHECKLIST:

- [x] URL parameter support (`?platform=LINKEDIN`)
- [x] Platform detection from URL
- [x] Visual indicator on application form
- [x] Platform included in form submission
- [x] Platform saved to database
- [x] Platform displayed in candidate list
- [x] Platform filtering in Job Details
- [x] Platform analytics in Analytics page
- [x] Copy-to-clipboard functionality
- [x] Branded platform buttons

**Status: FULLY FUNCTIONAL** ✅
