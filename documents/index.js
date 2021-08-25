var fs = require("fs");
var path = require("path");
const moment = require("moment");
// styles file
var today = moment().format("D-MMM-YYYY");
const styles = `<style>
.justify-content-between{
   display: flex;
   justify-content: space-between;
}
.more-space{
  margin: 10px 0 50px 0;
}
.invoice-box {
max-width: 800px;
margin: auto;
padding: 30px;
border: 1px solid #eee;
box-shadow: 0 0 10px rgba(0, 0, 0, .15);
font-size: 16px;
line-height: 24px;
color: #555;
font-family: 'Helvetica Neue', 'Helvetica',
}
.margin-top {
margin-top: 50px;
}
.justify-center {
text-align: center;
}
.invoice-box table {
width: 100%;
line-height: inherit;
text-align: left;
}
.invoice-box table td {
padding: 5px;
vertical-align: top;
}
.invoice-box table tr td:nth-child(2) {
text-align: center;
}
.invoice-box table tr td:nth-child(3) {
text-align: right;
}
.invoice-box table tr.top table td {
padding-bottom: 20px;
}
.invoice-box table tr.top table td.title {
font-size: 45px;
line-height: 45px;
color: #333;
}
.invoice-box table tr.information table td {
padding-bottom: 20px;
}
.invoice-box table tr.heading td {
background: #eee;
border-bottom: 1px solid #ddd;
font-weight: bold;
}
.invoice-box table tr.details td {
padding-bottom: 20px;
}
.invoice-box table tr.item td {
border-bottom: 1px solid #eee;
}
.invoice-box table tr.item.last td {
border-bottom: none;
}
.invoice-box table tr.total td:nth-child(2) {
border-top: 2px solid #eee;
font-weight: bold;
}
@media only screen and (max-width: 600px) {
.invoice-box table tr.top table td {
width: 100%;
display: block;
text-align: center;
}
.invoice-box table tr.information table td {
width: 100%;
display: block;
text-align: center;
}
}
</style>`;
// Structures of dinaminc files
const buildInventoryHTML = (data) => {
  return `  <!doctype html>
   <html>
      <head>
         <meta charset="utf-8">
         <title>Inventory Report</title>
         ${styles}
      </head>
      <body>
         <div class="invoice-box ">
            <h1 class='justify-center more-space'>Inventory Reports</h1>
            <table cellpadding="0" cellspacing="0">
               <tr class="top">
                  <td colspan="2">
                     <table>
                        <tr>
                           <td class="title"><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" fill="currentColor" class="bi bi-truck" viewBox="0 0 16 16">
                           <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                        </svg></td>
                           <td>
                              Date: ${today}
                           </td>
                        </tr>
                     </table>
                  </td>
               </tr>
               <tr class="information">
                  <td colspan="2">
                     <table>
                        <tr>
                           <td>
                              Report Name: Inventory 
                           </td>
                        </tr>
                     </table>
                  </td>
               </tr>
               <tr class="heading">
                  <td>Vehicles:</td>
                  <td>Services:</td>
                  <td>Usage(times):</td>
                  <td>Usage(km):</td>
               </tr>
               ${data}
            </table>
            <br />
            <h2 class="justify-center">Total Inventory :${data.length}</h4>
         </div>
      </body>
   </html>
`;
};
const buildPickupHTML = (data) => {
  return `
  <!doctype html>
  <html>
     <head>
        <meta charset="utf-8">
        <title>Pickup Reports</title>
      ${styles}
     </head>
     <body>
        <div class="invoice-box ">
           <h1 class='justify-center more-space'>Pickup Reports</h1>
           <table cellpadding="0" cellspacing="0">
              <tr class="top">
                 <td colspan="2">
                    <table>
                       <tr>
                          <td class="title"><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" fill="currentColor" class="bi bi-geo-alt" viewBox="0 0 16 16">
                            <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
                            <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                          </svg></td>
                          <td>
                             Date: ${today}
                          </td>
                       </tr>
                    </table>
                 </td>
              </tr>
              <tr class="information">
                 <td colspan="2">
                    <table>
                       <tr>
                          <td>
                             Report Name: Pickup
                          </td>
                       </tr>
                    </table>
                 </td>
              </tr>
              <tr class="heading">
                 <td>Vehicles:</td>
                 <td>Route:</td>
                 <td>Schedule:</td>
                 <td>Distance:</td>
                 <td>Accidents:</td>
              </tr>
              ${data}
           </table>
           <br />
           <div class="justify-content-between">
               <h3 class="justify-center">Total Vehicle: ${data.length}</h3>
           </div>
        </div>
     </body>
  </html>`;
};
const buildServiceHTML = (data) => {
  return `<!doctype html>
   <html>
      <head>
         <meta charset="utf-8">
         <title>Service Reports</title>
       ${styles}
      </head>
      <body>
         <div class="invoice-box ">
            <h1 class='justify-center more-space'>Service Reports</h1>
            <table cellpadding="0" cellspacing="0">
               <tr class="top">
                  <td colspan="2">
                     <table>
                        <tr>
                           <td class="title"><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
                             <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                             <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                           </svg></td>
                           <td>
                              Date: ${today}
                           </td>
                        </tr>
                     </table>
                  </td>
               </tr>
               <tr class="information">
                  <td colspan="2">
                     <table>
                        <tr>
                           <td>
                              Report Name: Service
                           </td>
                        </tr>
                     </table>
                  </td>
               </tr>
               <tr class="heading">
                  <td>Vehicle:</td>
                  <td>Type:</td>
                  <td>Date:</td>
                  <td>Part :</td>
                  <td>Cost :</td>
               </tr>
               ${data}
            </table>
            <br />
            <div class="justify-content-between">
                <h3 class="justify-center">Total Service:${data.length}</h3>
            </div>
         </div>
      </body>
   </html>`;
};
const buildLoanHTML = (data) => {
  return `
   <!doctype html>
  <html>
     <head>
        <meta charset="utf-8">
        <title>Loan Reports</title>
       ${styles}
     </head>
     <body>
        <div class="invoice-box ">
           <h1 class='justify-center more-space'>Loan Reports</h1>
           <table cellpadding="0" cellspacing="0">
              <tr class="top">
                 <td colspan="2">
                    <table>
                       <tr>
                          <td class="title"><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" fill="currentColor" class="bi bi-bicycle" viewBox="0 0 16 16">
                            <path d="M4 4.5a.5.5 0 0 1 .5-.5H6a.5.5 0 0 1 0 1v.5h4.14l.386-1.158A.5.5 0 0 1 11 4h1a.5.5 0 0 1 0 1h-.64l-.311.935.807 1.29a3 3 0 1 1-.848.53l-.508-.812-2.076 3.322A.5.5 0 0 1 8 10.5H5.959a3 3 0 1 1-1.815-3.274L5 5.856V5h-.5a.5.5 0 0 1-.5-.5zm1.5 2.443-.508.814c.5.444.85 1.054.967 1.743h1.139L5.5 6.943zM8 9.057 9.598 6.5H6.402L8 9.057zM4.937 9.5a1.997 1.997 0 0 0-.487-.877l-.548.877h1.035zM3.603 8.092A2 2 0 1 0 4.937 10.5H3a.5.5 0 0 1-.424-.765l1.027-1.643zm7.947.53a2 2 0 1 0 .848-.53l1.026 1.643a.5.5 0 1 1-.848.53L11.55 8.623z"/>
                          </svg></td>
                          <td>
                             Date: ${today}
                          </td>
                       </tr>
                    </table>
                 </td>
              </tr>
              <tr class="information">
                 <td colspan="2">
                    <table>
                       <tr>
                          <td>
                             Report Name: Loan
                          </td>
                       </tr>
                    </table>
                 </td>
              </tr>
              <tr class="heading">
                 <td>Vehicles:</td>
                 <td>Date:</td>
                 <td>Problem:</td>
                 <td>Borrowe:</td>
              </tr>
              ${data}
           </table>
           <br />
           <div class="justify-content-between">
               <h3 class="justify-center">Total Vehicle: ${data.length} </h3>
           </div>
        </div>
     </body>
  </html>
   `;
};

// Create dinamic files
const inventoryHTML = (data) => {
  let filename = path.join(__dirname, "inventory.html");
  var stream = fs.createWriteStream(filename);
  stream.once("open", function () {
    var html = buildInventoryHTML(data);
    stream.end(html);
  });
};
const pickupHTML = (data) => {
  let filename = path.join(__dirname, "pickup.html");
  var stream = fs.createWriteStream(filename);
  stream.once("open", function () {
    var html = buildPickupHTML(data);
    stream.end(html);
  });
};
const serviceHTML = (data) => {
  let filename = path.join(__dirname, "service.html");
  var stream = fs.createWriteStream(filename);
  stream.once("open", function () {
    var html = buildServiceHTML(data);
    stream.end(html);
  });
};
const loanHTML = (data) => {
  let filename = path.join(__dirname, "loan.html");
  var stream = fs.createWriteStream(filename);
  stream.once("open", function () {
    var html = buildLoanHTML(data);
    stream.end(html);
  });
};

module.exports.inventoryHTML = inventoryHTML;
module.exports.pickupHTML = pickupHTML;
module.exports.serviceHTML = serviceHTML;
module.exports.loanHTML = loanHTML;
