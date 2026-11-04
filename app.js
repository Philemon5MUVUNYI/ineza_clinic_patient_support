const $ = (id) => document.getElementById(id);
const today = new Date();
const isoToday = () => new Date().toISOString().slice(0,10);
const uid = (prefix) => prefix + "-" + Math.random().toString(36).slice(2,7).toUpperCase();
const seed = {
  patients:[
    {id:"INZ-1001",name:"Alice Uwase",phone:"+250 788 123 456",email:"alice.uwase@email.com",gender:"Female",dob:"1996-04-12"},
    {id:"INZ-1002",name:"Jean Claude Niyonzima",phone:"+250 722 345 678",email:"jc.niyonzima@email.com",gender:"Male",dob:"1988-09-20"},
    {id:"INZ-1003",name:"Diane Mukamana",phone:"+250 783 456 789",email:"diane.m@email.com",gender:"Female",dob:"2001-01-08"},
    {id:"INZ-1004",name:"Eric Habimana",phone:"+250 791 234 567",email:"eric.h@email.com",gender:"Male",dob:"1979-06-15"}
  ],
  requests:[
    {id:"SUP-2041",patientId:"INZ-1001",patient:"Alice Uwase",category:"Appointment inquiry",title:"Confirm my appointment time",description:"I would like to confirm the time for my follow-up visit this week.",priority:"Medium",status:"Open",date:isoToday()},
    {id:"SUP-2040",patientId:"INZ-1002",patient:"Jean Claude Niyonzima",category:"Billing",title:"Question about my invoice",description:"Could someone help me understand the charges on my last invoice?",priority:"Low",status:"In Progress",date:isoToday()},
    {id:"SUP-2039",patientId:"INZ-1003",patient:"Diane Mukamana",category:"Complaint",title:"Waiting time at reception",description:"I waited longer than expected before being attended to during my last visit.",priority:"High",status:"Open",date:isoToday()}
  ],
  appointments:[
    {id:"APT-301",patientId:"INZ-1001",patient:"Alice Uwase",doctor:"Dr. Grace Ingabire",date:isoToday(),time:"09:30",reason:"Follow-up consultation",status:"Confirmed"},
    {id:"APT-302",patientId:"INZ-1002",patient:"Jean Claude Niyonzima",doctor:"Dr. Patrick Mugisha",date:isoToday(),time:"11:00",reason:"General check-up",status:"Confirmed"},
    {id:"APT-303",patientId:"INZ-1004",patient:"Eric Habimana",doctor:"Dr. Grace Ingabire",date:new Date(Date.now()+86400000).toISOString().slice(0,10),time:"14:00",reason:"Consultation",status:"Pending"}
  ],
  doctors:[
    {name:"Dr. Grace Ingabire",specialty:"General Practitioner",phone:"+250 788 555 010",email:"grace@inezaclinic.rw",hours:"Mon – Fri, 08:00 – 16:00"},
    {name:"Dr. Patrick Mugisha",specialty:"Family Medicine",phone:"+250 788 555 011",email:"patrick@inezaclinic.rw",hours:"Mon – Sat, 09:00 – 17:00"},
    {name:"Dr. Aline Uwimana",specialty:"Pediatrics",phone:"+250 788 555 012",email:"aline@inezaclinic.rw",hours:"Mon – Fri, 08:00 – 15:00"}
  ]
};
let db = loadDB();
function loadDB(){try{return JSON.parse(localStorage.getItem("inezaClinicDB"))||structuredClone(seed)}catch{return structuredClone(seed)}}
function save(){localStorage.setItem("inezaClinicDB",JSON.stringify(db));renderAll()}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function initials(name){return name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}
function niceDate(d){if(!d)return "—";return new Date(d+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
function statusClass(s){return s.toLowerCase().replace(/\s+/g,"-")}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
function showApp(){ $("loginScreen").classList.add("hidden");$("appShell").classList.remove("hidden");$("todayLabel").textContent=today.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});renderAll() }
$("loginForm").addEventListener("submit",e=>{e.preventDefault();if($("loginEmail").value==="admin@inezaclinic.rw"&&$("loginPassword").value==="ineza123"){showApp()}else toast("Demo login: admin@inezaclinic.rw / ineza123")});
$("logoutBtn").addEventListener("click",()=>{$("appShell").classList.add("hidden");$("loginScreen").classList.remove("hidden")});
function navigate(page){document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));$(page+"Page").classList.add("active");document.querySelectorAll(".nav-item[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("breadcrumbPage").textContent=page.charAt(0).toUpperCase()+page.slice(1);$("sidebar").classList.remove("open")}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
$("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("helpBtn").addEventListener("click",()=>toast("Please contact your clinic system administrator."));
$("notificationBtn").addEventListener("click",()=>toast(`${db.requests.filter(r=>r.status!=="Resolved").length} support requests need attention.`));
document.addEventListener("click",e=>{const a=e.target.closest("[data-action]");if(a)openForm(a.dataset.action)});
function renderAll(){renderDashboard();renderPatients();renderRequests();renderAppointments();renderDoctors()}
function renderDashboard(){
 $("statPatients").textContent=db.patients.length;$("statRequests").textContent=db.requests.filter(r=>r.status!=="Resolved").length;
 $("statAppointments").textContent=db.appointments.filter(a=>a.date===isoToday()).length;$("statDoctors").textContent=db.doctors.length;
 $("openRequestBadge").textContent=db.requests.filter(r=>r.status!=="Resolved").length;
 const recent=[...db.requests].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);
 $("recentRequests").innerHTML=recent.length?recent.map(r=>`<tr><td><div class="patient-cell"><span class="tiny-avatar">${initials(r.patient)}</span>${esc(r.patient)}</div></td><td>${esc(r.title)}</td><td><span class="priority ${r.priority.toLowerCase()}">${r.priority}</span></td><td><span class="status ${statusClass(r.status)}">${r.status}</span></td></tr>`).join(""):`<tr><td colspan="4" class="empty-state">No support requests yet.</td></tr>`;
 const upcoming=[...db.appointments].filter(a=>a.date>=isoToday()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,4);
 $("upcomingAppointments").innerHTML=upcoming.length?upcoming.map(a=>{let d=new Date(a.date+"T00:00:00");return `<div class="upcoming-item"><div class="date-tile">${d.toLocaleDateString("en",{month:"short"}).toUpperCase()}<b>${d.getDate()}</b></div><div class="upcoming-info"><b>${esc(a.patient)}</b><small>${esc(a.doctor)}</small></div><span class="upcoming-time">${esc(a.time)}</span></div>`}).join(""):`<div class="empty-state">No upcoming appointments.</div>`;
}
function renderPatients(){
 const q=($("patientSearch")?.value||"").toLowerCase();const list=db.patients.filter(p=>[p.id,p.name,p.phone,p.email].join(" ").toLowerCase().includes(q));
 $("patientCount").textContent=`${list.length} patients`;
 $("patientsTable").innerHTML=list.length?list.map(p=>`<tr><td><b>${esc(p.id)}</b></td><td><div class="patient-cell"><span class="tiny-avatar">${initials(p.name)}</span>${esc(p.name)}</div></td><td>${esc(p.phone)}</td><td>${esc(p.email)}</td><td>${esc(p.gender)}</td><td><button class="action-link" onclick="editPatient('${p.id}')">Edit</button> <button class="action-link" onclick="deletePatient('${p.id}')">Delete</button></td></tr>`).join(""):`<tr><td colspan="6"><div class="empty-state"><b>No patients found</b>Try another search or add a patient.</div></td></tr>`;
}
function renderRequests(){
 const q=($("requestSearch")?.value||"").toLowerCase(),s=$("statusFilter")?.value||"all",p=$("priorityFilter")?.value||"all";
 const list=[...db.requests].filter(r=>[r.id,r.patient,r.title,r.category].join(" ").toLowerCase().includes(q)&&(s==="all"||r.status===s)&&(p==="all"||r.priority===p)).sort((a,b)=>b.date.localeCompare(a.date));
 $("supportCards").innerHTML=list.length?list.map(r=>`<article class="support-card"><div class="support-card-top"><div><h3>${esc(r.title)}</h3><div class="support-meta">${esc(r.id)} · ${esc(r.patient)} · ${niceDate(r.date)} · ${esc(r.category)}</div></div><div><span class="priority ${r.priority.toLowerCase()}">${r.priority}</span> <span class="status ${statusClass(r.status)}">${r.status}</span></div></div><p class="support-desc">${esc(r.description)}</p><div class="support-footer"><small>Patient ID: ${esc(r.patientId||"Not linked")}</small><div class="support-actions"><button class="small-btn" onclick="cycleRequest('${r.id}')">${r.status==="Open"?"Start working":r.status==="In Progress"?"Mark resolved":"Reopen"}</button><button class="small-btn" onclick="deleteRequest('${r.id}')">Delete</button></div></div></article>`).join(""):`<div class="panel empty-state"><b>No requests found</b>There are no requests matching these filters.</div>`;
}
function renderAppointments(){
 const q=($("appointmentSearch")?.value||"").toLowerCase();const list=[...db.appointments].filter(a=>[a.patient,a.doctor,a.reason].join(" ").toLowerCase().includes(q)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 $("appointmentCount").textContent=`${list.length} appointments`;
 $("appointmentsTable").innerHTML=list.length?list.map(a=>`<tr><td><div class="patient-cell"><span class="tiny-avatar">${initials(a.patient)}</span>${esc(a.patient)}</div></td><td>${esc(a.doctor)}</td><td>${niceDate(a.date)}<br><small>${esc(a.time)}</small></td><td>${esc(a.reason)}</td><td><span class="status ${statusClass(a.status==="Confirmed"?"Resolved":a.status==="Pending"?"Open":"In Progress")}">${esc(a.status)}</span></td><td><button class="action-link" onclick="cycleAppointment('${a.id}')">Update</button> <button class="action-link" onclick="deleteAppointment('${a.id}')">Delete</button></td></tr>`).join(""):`<tr><td colspan="6"><div class="empty-state"><b>No appointments found</b>Book an appointment to get started.</div></td></tr>`;
}
function renderDoctors(){
 $("doctorGrid").innerHTML=db.doctors.map(d=>`<article class="doctor-card"><div class="doctor-top"><div class="doctor-avatar">${initials(d.name)}</div><div><h3>${esc(d.name)}</h3><p>${esc(d.specialty)}</p></div></div><div class="doctor-details"><span>☎ &nbsp;${esc(d.phone)}</span><span>✉ &nbsp;${esc(d.email)}</span><span>◷ &nbsp;${esc(d.hours)}</span></div></article>`).join("")||`<div class="panel empty-state">No doctors added yet.</div>`;
}
["patientSearch","requestSearch","appointmentSearch"].forEach(id=>$(id).addEventListener("input",()=>({patientSearch:renderPatients,requestSearch:renderRequests,appointmentSearch:renderAppointments}[id])()));
["statusFilter","priorityFilter"].forEach(id=>$(id).addEventListener("change",renderRequests));
function modal(title,eyebrow,html){$("modalTitle").textContent=title;$("modalEyebrow").textContent=eyebrow;$("modalBody").innerHTML=html;$("modalBackdrop").classList.remove("hidden")}
function closeModal(){$("modalBackdrop").classList.add("hidden")}
$("closeModal").addEventListener("click",closeModal);$("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))closeModal()});
function field(label,name,type="text",value="",required=true,extra=""){return `<div class="form-field"><label>${label}${required?" *":""}</label><input name="${name}" type="${type}" value="${esc(value)}" ${required?"required":""} ${extra}></div>`}
function selectField(label,name,options,value=""){return `<div class="form-field"><label>${label} *</label><select name="${name}" required>${options.map(o=>`<option ${o===value?"selected":""}>${o}</option>`).join("")}</select></div>`}
function openForm(action,id){
 if(action==="new-patient"||action==="edit-patient"){
  const p=id?db.patients.find(x=>x.id===id):{};modal(id?"Edit patient":"Register patient","PATIENT RECORD",`<form id="recordForm"><div class="form-grid">${field("Full name","name","text",p.name||"")}${field("Phone number","phone","tel",p.phone||"")}${field("Email address","email","email",p.email||"")}${selectField("Gender","gender",["Female","Male","Other"],p.gender||"Female")}${field("Date of birth","dob","date",p.dob||"",false)}</div><div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Save patient</button></div></form>`);
  $("recordForm").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if(id)Object.assign(p,d);else db.patients.push({id:uid("INZ"),...d});save();closeModal();toast(id?"Patient updated":"Patient registered successfully")};
 }
 if(action==="new-request"){
  const opts=db.patients.map(p=>p.name);modal("Create support request","PATIENT EXPERIENCE",`<form id="recordForm"><div class="form-grid">${selectField("Patient","patient",opts)}${selectField("Category","category",["General inquiry","Appointment inquiry","Billing","Complaint","Medical assistance","Other"])}<div class="form-field full-field">${field("Request title","title","text")}</div><div class="form-field full-field"><label>Description *</label><textarea name="description" required placeholder="Describe the patient's request..."></textarea></div>${selectField("Priority","priority",["Low","Medium","High"])}</div><div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Create request</button></div></form>`);
  $("recordForm").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),p=db.patients.find(x=>x.name===d.patient);db.requests.push({id:uid("SUP"),patient:d.patient,patientId:p?.id||"",date:isoToday(),status:"Open",...d});save();closeModal();toast("Support request created")};
 }
 if(action==="new-appointment"){
  const patients=db.patients.map(p=>p.name),doctors=db.doctors.map(d=>d.name);modal("Book appointment","SCHEDULE A VISIT",`<form id="recordForm"><div class="form-grid">${selectField("Patient","patient",patients)}${selectField("Doctor","doctor",doctors)}${field("Appointment date","date","date",isoToday())}${field("Time","time","time","09:00")}${field("Reason for visit","reason","text","",true)}${selectField("Status","status",["Confirmed","Pending","Cancelled"],"Confirmed")}</div><div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Save appointment</button></div></form>`);
  $("recordForm").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),p=db.patients.find(x=>x.name===d.patient);db.appointments.push({id:uid("APT"),patientId:p?.id||"",...d});save();closeModal();toast("Appointment booked")};
 }
 if(action==="new-doctor"){
  modal("Add doctor","CARE TEAM",`<form id="recordForm"><div class="form-grid">${field("Doctor name","name")}${field("Specialization","specialty")}${field("Phone","phone","tel")}${field("Email","email","email")}${field("Working hours","hours","text","Mon – Fri, 08:00 – 16:00",true)}</div><div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Add doctor</button></div></form>`);
  $("recordForm").onsubmit=e=>{e.preventDefault();db.doctors.push(Object.fromEntries(new FormData(e.target)));save();closeModal();toast("Doctor added to directory")};
 }
}
function editPatient(id){openForm("edit-patient",id)}
function deletePatient(id){if(confirm("Delete this patient record? Related support requests and appointments will remain.")){db.patients=db.patients.filter(p=>p.id!==id);save();toast("Patient deleted")}}
function cycleRequest(id){const r=db.requests.find(x=>x.id===id);r.status=r.status==="Open"?"In Progress":r.status==="In Progress"?"Resolved":"Open";save();toast("Request status updated")}
function deleteRequest(id){if(confirm("Delete this support request?")){db.requests=db.requests.filter(r=>r.id!==id);save();toast("Request deleted")}}
function cycleAppointment(id){const a=db.appointments.find(x=>x.id===id);a.status=a.status==="Pending"?"Confirmed":a.status==="Confirmed"?"Completed":"Pending";save();toast("Appointment status updated")}
function deleteAppointment(id){if(confirm("Delete this appointment?")){db.appointments=db.appointments.filter(a=>a.id!==id);save();toast("Appointment deleted")}}
window.editPatient=editPatient;window.deletePatient=deletePatient;window.cycleRequest=cycleRequest;window.deleteRequest=deleteRequest;window.cycleAppointment=cycleAppointment;window.deleteAppointment=deleteAppointment;window.closeModal=closeModal;
