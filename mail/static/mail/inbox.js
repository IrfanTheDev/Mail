document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(Areply, whom) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // My solution code.
  
  if (Areply === 'reply') {
    document.querySelector('#compose-recipients').value = whom.sender
    document.querySelector('#compose-body').value = `[ On ${whom.timestamp} ${whom.sender} wrote: ${whom.body}.]`
    // regular expression to check a particular word in sentence.
    if (/Re:/.test(whom.subject)) {
      document.querySelector('#compose-subject').value = `${whom.subject}`
    }else{
      document.querySelector('#compose-subject').value = `Re: ${whom.subject}`
    }    
  }

  document.querySelector('#compose-form').onsubmit = function (){
    // console.log('your solution code is working fine.');

    const RECIPIENTS = document.querySelector('#compose-recipients').value;
    const SUBJECT = document.querySelector('#compose-subject').value;
    const BODY = document.querySelector('#compose-body').value;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: RECIPIENTS,
        subject: SUBJECT,
        body: BODY
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      if (result.error) {
        // console.log(result)
        document.querySelector('#compose-error-message').innerHTML = result.error;

        setTimeout(function(){
          document.getElementById("compose-error-message").innerHTML = '';
        }, 3000)

      }
      else{
        // console.log(result)
        document.querySelector('#message-view').style.display = 'block';
        document.querySelector('#message-view').innerHTML = result.message;

        setTimeout(function(){
          document.getElementById("message-view").innerHTML = '';
          document.querySelector('#message-view').style.display = 'none';
        }, 3000)

        load_mailbox('sent');
      }
    });
    return false;
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // my solution code.

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    //  console.log(emails);
    emails.forEach(emails => {
      
      let  sender = emails.sender;
      if( mailbox === 'sent'){
        sender = emails.recipients;
      }

      const element = document.createElement('div');
      
      element.innerHTML =`<b>${sender}</b> : ${emails.subject} <span class="timestamp">${emails.timestamp}</span>` ;
      if ( emails.read === true){
        element.className = "mailbox-view-readed"
      }else{
        element.className = "mailbox-view"
      }
      document.querySelector('#emails-view').append(element);

      // Must include ()=> if the function is taking arguments otherwise it will run automatically.
      element.addEventListener('click', () => load_a_mail(emails, mailbox));

       
    }); 
  });
}

//My solution code
function load_a_mail(emails, mailbox){
  // console.log('This element has been clicked!')

  fetch(`/emails/${emails.id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    // console.log(email);
    
    if (mailbox === 'archive'){
      document.querySelector('#emails-view').innerHTML = `
          <div> <b>From:</b> ${email.sender} </div>
          <div> <b>To:</b> ${email.recipients} </div>
          <div> <b>Subject:</b> ${email.subject}</div>
          <div> <b>Timestamp:</b> ${email.timestamp}</div>
          <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
          <hr>
          <div> ${email.body} </div>
          <hr>
          <button class="btn btn-sm btn-outline-primary" id="unarchive">UnArchive</button>`
      document.querySelector('#reply').addEventListener('click', ()=> compose_email('reply', email));
      document.querySelector('#unarchive').addEventListener('click', ()=> fun_unarchive(email));

    } else if( mailbox === 'inbox'){
        document.querySelector('#emails-view').innerHTML = `
          <div> <b>From:</b> ${email.sender} </div>
          <div> <b>To:</b> ${email.recipients} </div>
          <div> <b>Subject:</b> ${email.subject}</div>
          <div> <b>Timestamp:</b> ${email.timestamp}</div>
          <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
          <hr>
          <div> ${email.body} </div> 
          <hr>
          <button class="btn btn-sm btn-outline-primary" id="archive">Archive</button>`
        document.querySelector('#reply').addEventListener('click', ()=> compose_email('reply', email));
        document.querySelector('#archive').addEventListener('click', ()=> fun_archive(email));
        // update the database that this email has been read.(read= true)
        fun_read(email);

      } else if(mailbox === 'sent'){
        document.querySelector('#emails-view').innerHTML = `
          <div> <b>From:</b> ${email.sender} </div>
          <div> <b>To:</b> ${email.recipients} </div>
          <div> <b>Subject:</b> ${email.subject}</div>
          <div> <b>Timestamp:</b> ${email.timestamp}</div>
          <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
          <hr>
          <div> ${email.body} </div>`
          
        document.querySelector('#reply').addEventListener('click', ()=> compose_email('reply', email));

      }
    // ... do something else with email ...
  });
}

function fun_archive (email){
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  return load_mailbox('archive')
}
function fun_unarchive (email){
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  return load_mailbox('inbox')
}

function fun_read (email){
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}
