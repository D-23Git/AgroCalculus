const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Desktop', 'agro-app', 'src', 'components', 'MarketPage.js');
let content = fs.readFileSync(filePath, 'utf8');

// REGEX for button click
const btnRegex = /<button className="amc-login-btn-final" onClick=\{\(\) => \{[\s\S]*?if \(selMkt && staffPinInput === AgroService\.getMarketPIN\(selMkt\.id\) && staffIdInput\.startsWith\('APMC'\)\) \{[\s\S]*?handleStaffLogin\(true\);[\s\S]*?setShowAuthModal\(false\);[\s\S]*?\} else \{[\s\S]*?alert\(L === 'mr' \? 'चुकीचा आयडी किंवा पिन!' : 'Invalid ID or PIN!'\);[\s\S]*?\}[\s\S]*?\}\}>/;

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

content = content.replace(btnRegex, newBtn);

// REGEX for onKeyDown
const keyDownRegex = /onKeyDown=\{\(e\) => \{[\s\S]*?if \(e\.key === 'Enter'\) \{[\s\S]*?if \(selMkt && staffPinInput === AgroService\.getMarketPIN\(selMkt\.id\) && staffIdInput\.startsWith\('APMC'\)\) \{[\s\S]*?handleStaffLogin\(true\);[\s\S]*?setShowAuthModal\(false\);[\s\S]*?\} else \{[\s\S]*?alert\(L === 'mr' \? 'चुकीचा आयडी किंवा पिन!' : 'Invalid ID or PIN!'\);[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}\}/;

const newKeyDown = `onKeyDown={async (e) => {
                                  if (e.key === 'Enter') {
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
                                  }
                               }}`;

content = content.replace(keyDownRegex, newKeyDown);

fs.writeFileSync(filePath, content);
console.log('Regex Frontend Auth Update Complete!');
