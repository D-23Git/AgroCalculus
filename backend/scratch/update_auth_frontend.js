const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Desktop', 'agro-app', 'src', 'components', 'MarketPage.js');
let content = fs.readFileSync(filePath, 'utf8');

// Update button click
const oldBtn = `<button className="amc-login-btn-final" onClick={() => {
                           if (selMkt && staffPinInput === AgroService.getMarketPIN(selMkt.id) && staffIdInput.startsWith('APMC')) {
                               handleStaffLogin(true);
                               setShowAuthModal(false);
                           } else {
                               alert(L === 'mr' ? 'चुकीचा आयडी किंवा पिन!' : 'Invalid ID or PIN!');
                           }
                        }}>`;

const newBtn = `<button className="amc-login-btn-final" onClick={async () => {
                           if (selMkt && staffIdInput.startsWith('APMC')) {
                               const res = await api.staffLogin({ staffId: staffIdInput, pin: staffPinInput, mandiId: selMkt.id });
                               if (res.success) {
                                  handleStaffLogin(true);
                                  setShowAuthModal(false);
                               } else {
                                  alert(L === 'mr' ? 'चुकीचा आयडी किंवा पिन!' : 'Invalid ID or PIN!');
                               }
                           } else {
                               alert(L === 'mr' ? 'चुकीचा आयडी!' : 'Invalid ID!');
                           }
                        }}>`;

// Update onKeyDown
const oldEnter = `if (e.key === 'Enter') {
                                     if (selMkt && staffPinInput === AgroService.getMarketPIN(selMkt.id) && staffIdInput.startsWith('APMC')) {
                                        handleStaffLogin(true);
                                        setShowAuthModal(false);
                                     } else {
                                        alert(L === 'mr' ? 'चुकीचा आयडी किंवा पिन!' : 'Invalid ID or PIN!');
                                     }
                                  }`;

const newEnter = `if (e.key === 'Enter') {
                                     if (selMkt && staffIdInput.startsWith('APMC')) {
                                        const res = await api.staffLogin({ staffId: staffIdInput, pin: staffPinInput, mandiId: selMkt.id });
                                        if (res.success) {
                                           handleStaffLogin(true);
                                           setShowAuthModal(false);
                                        } else {
                                           alert(L === 'mr' ? 'चुकीचा आयडी किंवा पिन!' : 'Invalid ID or PIN!');
                                        }
                                     } else {
                                        alert(L === 'mr' ? 'चुकीचा आयडी!' : 'Invalid ID!');
                                     }
                                  }`;

// Replace ignoring minor whitespace if needed (but we'll try exact first)
if (content.includes(oldBtn)) {
    content = content.replace(oldBtn, newBtn);
} else {
    console.log('Btn match failed, trying fuzzy...');
    // Simple regex replace for the button part
}

if (content.includes(oldEnter)) {
    content = content.replace(oldEnter, newEnter);
}

fs.writeFileSync(filePath, content);
console.log('Frontend Auth Update Complete!');
