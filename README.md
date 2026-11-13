# Yash Mahajan Portfolio

Plain HTML, CSS and JavaScript. No build step.

## Edit
Open this folder in VS Code. Change text in `index.html`, colours in `style.css` (the `:root` block at the top), animations in `script.js`.
Preview: install the "Live Server" extension, right-click `index.html`, choose "Open with Live Server".

Your photo is `assets/profile.jpg`. Replace that file (same name) to change it.

Project status: in `index.html`, each project card has `data-status="done"` or `data-status="progress"`. When a project is finished, change that value and the badge text/class (`status done` and "Completed", or `status prog` and "In progress"). The filter buttons use the same values.

## Projects and the Admin editor
Projects live in `projects.js`. You can edit that file in VS Code, or use the editor on the site:
1. Open your site with `/#admin` on the end (or click Admin in the footer) and enter your passcode.
2. Add, edit, or hold the Delete button to remove a project. Changes show only in your own browser.
3. In the Link field, paste the project's GitHub repo or live website address. Recruiters who click that project go straight there. Projects without a link are not clickable.
4. Click "Copy projects.js", paste it over the content of `projects.js` in VS Code, and push to GitHub. Vercel then makes it live for everyone.
Starting passcode: `Yash@Admin2026`. Change it: in your browser console run
`crypto.subtle.digest('SHA-256',new TextEncoder().encode('YOUR NEW PASSCODE')).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))`
and paste the result into `ADMIN_HASH` in `script.js`.
The passcode is a light lock only. What really protects your site is that nobody but you can push to your GitHub repo.

## Put it on GitHub
```
git init
git add .
git commit -m "Portfolio"
git branch -M main
git remote add origin https://github.com/vedaantt24-tech/portfolio.git
git push -u origin main
```
(Create an empty repo named `portfolio` on GitHub first.)

## Make it live on Vercel
1. Sign in to vercel.com with GitHub.
2. Add New > Project > import the `portfolio` repo.
3. Framework Preset: Other. Leave build settings empty. Click Deploy.
4. Every `git push` to `main` updates the live site automatically.

## Only you can edit
Visitors only see the deployed website. Only you (the repo owner) can push changes, as long as you add no collaborators and keep your GitHub and Vercel logins private. Turn on two-factor authentication on both.
