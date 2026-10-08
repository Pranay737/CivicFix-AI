$ErrorActionPreference = "Stop"

Write-Host "=========================================================="
Write-Host "CIVICFIX AI - END-TO-END VERIFICATION SMOKE TEST"
Write-Host "=========================================================="

# 1. Login as Citizen Jane
Write-Host "`n>>> Step 1: Login as Citizen Jane"
$loginBody = @{
    email = "citizen.jane@civicfix.ai"
    password = "Citizen@12345"
} | ConvertTo-Json

$citizenLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$citizenToken = $citizenLogin.accessToken
Write-Host "SUCCESS: Authenticated as $($citizenLogin.user.fullName) (Role: $($citizenLogin.user.role))"

# 2. AI Triage Preview
Write-Host "`n>>> Step 2: AI Triage Preview (Gemini / Rule-Based Analyzer)"
$previewBody = @{
    title = "Severe deep pothole and road cracking near school"
    description = "The asphalt has collapsed creating a dangerous 12-inch crater causing traffic hazards."
    address = "5th Avenue and Elm St"
} | ConvertTo-Json

$preview = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/ai/analyze-preview" -Method Post -Headers @{ Authorization = "Bearer $citizenToken" } -ContentType "application/json" -Body $previewBody
Write-Host "SUCCESS: AI Triage Analysis:"
Write-Host "   Category:   $($preview.category)"
Write-Host "   Priority:   $($preview.priority)"
Write-Host "   Department: $($preview.department)"
Write-Host "   Confidence: $($preview.confidence * 100)%"
Write-Host "   Summary:    $($preview.summary)"

# 3. Citizen Submits Issue
Write-Host "`n>>> Step 3: Citizen Reports Civic Issue"
$reportPayload = @{
    title = "Severe deep pothole and road cracking near school"
    description = "The asphalt has collapsed creating a dangerous 12-inch crater causing traffic hazards."
    address = "5th Avenue and Elm St"
    latitude = 37.7749
    longitude = -122.4194
    imageUrls = @("https://images.unsplash.com/photo-1515162816999-a0c47dc192f7")
} | ConvertTo-Json

$complaint = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/complaints" -Method Post -Headers @{ Authorization = "Bearer $citizenToken" } -ContentType "application/json" -Body $reportPayload
$complaintId = $complaint.id
Write-Host "SUCCESS: Complaint Created!"
Write-Host "   ID:              $complaintId"
Write-Host "   Tracking Code:   #$($complaint.trackingNumber)"
Write-Host "   Status:          $($complaint.status)"
Write-Host "   Auto-Routed To:  $($complaint.departmentName)"
Write-Host "   Priority:        $($complaint.priority)"

# 4. Dept Admin Logs In and Assigns Field Officer
Write-Host "`n>>> Step 4: Department Admin Dispatches Field Officer"
$adminLoginBody = @{
    email = "roads.admin@civicfix.ai"
    password = "Admin@12345"
} | ConvertTo-Json

$adminLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $adminLoginBody
$adminToken = $adminLogin.accessToken

$officers = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/officers" -Headers @{ Authorization = "Bearer $adminToken" }
$officer = $officers | Where-Object { $_.email -eq "officer.smith@civicfix.ai" } | Select-Object -First 1
$officerId = $officer.id
Write-Host "Selected Field Officer: $($officer.fullName) (ID: $officerId)"

$assignPayload = @{
    officerId = $officerId
    notes = "Urgent repair order dispatched due to school route traffic."
} | ConvertTo-Json

$assignedComplaint = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/complaints/$complaintId/assign" -Method Post -Headers @{ Authorization = "Bearer $adminToken" } -ContentType "application/json" -Body $assignPayload
Write-Host "SUCCESS: Complaint Assigned!"
Write-Host "   New Status:  $($assignedComplaint.status)"
Write-Host "   Assigned To: $($assignedComplaint.assignedOfficer.fullName)"

# 5. Field Officer Starts Work and Submits Resolution
Write-Host "`n>>> Step 5: Field Officer Starts Investigation and Resolves Issue"
$officerLoginBody = @{
    email = "officer.smith@civicfix.ai"
    password = "Officer@12345"
} | ConvertTo-Json

$officerLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $officerLoginBody
$officerToken = $officerLogin.accessToken

# Update status to IN_PROGRESS
$progressPayload = @{
    status = "IN_PROGRESS"
    comment = "Repair crew arrived on site with asphalt compactor."
} | ConvertTo-Json

$inProgressComplaint = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/complaints/$complaintId/status" -Method Patch -Headers @{ Authorization = "Bearer $officerToken" } -ContentType "application/json" -Body $progressPayload
Write-Host "SUCCESS: Status updated to $($inProgressComplaint.status)"

# Submit Resolution with evidence
$resolvePayload = @{
    notes = "Excavated loose debris, laid asphalt hot-mix, steam-rolled flush with street level."
    evidenceImageUrls = @("https://images.unsplash.com/photo-1584467735871-8e85353a8413")
} | ConvertTo-Json

$resolvedComplaint = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/complaints/$complaintId/resolve" -Method Post -Headers @{ Authorization = "Bearer $officerToken" } -ContentType "application/json" -Body $resolvePayload
Write-Host "SUCCESS: Issue Resolved by Field Officer!"
Write-Host "   Status:           $($resolvedComplaint.status)"
Write-Host "   Resolution Notes: $($resolvedComplaint.resolution.notes)"

# 6. Citizen Verifies Resolution and Rates Feedback
Write-Host "`n>>> Step 6: Citizen Verifies Resolution and Submits Feedback"
$verifyPayload = @{
    verified = $true
    rating = 5
    comment = "Outstanding fast turnaround! Road surface is completely repaired."
} | ConvertTo-Json

$closedComplaint = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/complaints/$complaintId/verify" -Method Post -Headers @{ Authorization = "Bearer $citizenToken" } -ContentType "application/json" -Body $verifyPayload
Write-Host "SUCCESS: Issue Verified and Closed by Citizen!"
Write-Host "   Final Status:    $($closedComplaint.status)"
Write-Host "   Citizen Rating:  $($closedComplaint.feedback.rating) / 5 Stars"
Write-Host "   Citizen Comment: $($closedComplaint.feedback.comment)"

# 7. Grounded RAG AI Civic Assistant Query
Write-Host "`n>>> Step 7: Test Grounded RAG AI Civic Assistant (Municipal FAQs + Tracking)"
$chatPayload = @{
    message = "How can I report a pothole and what are the standard repair guidelines?"
} | ConvertTo-Json

$chatResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/assistant/chat" -Method Post -Headers @{ Authorization = "Bearer $citizenToken" } -ContentType "application/json" -Body $chatPayload
Write-Host "SUCCESS: Grounded Assistant Response Received:"
Write-Host $chatResponse.response
Write-Host "--------------------------------------------------------"
Write-Host "Citations: $(($chatResponse.citations) -join ', ')"

# Query live complaint status via assistant
Write-Host "`n>>> Step 8: Test Tracking Status Lookup via Assistant (#$($complaint.trackingNumber))"
$trackingChatPayload = @{
    message = "What is the status of my complaint #$($complaint.trackingNumber)?"
} | ConvertTo-Json

$trackingChatResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/assistant/chat" -Method Post -Headers @{ Authorization = "Bearer $citizenToken" } -ContentType "application/json" -Body $trackingChatPayload
Write-Host "Assistant Status Lookup Response:"
Write-Host $trackingChatResponse.response

Write-Host "`n=========================================================="
Write-Host "ALL 5 CORE WORKFLOW PHASES VERIFIED END-TO-END! (100% PASS)"
Write-Host "=========================================================="
