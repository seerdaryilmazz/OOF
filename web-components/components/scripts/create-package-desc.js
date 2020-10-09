import path from 'path';
import fse from 'fs-extra';

createPackageFile();

function createPackageFile() {
    return new Promise((resolve) => {
        fse.readFile(path.resolve(__dirname, '../package.json'), 'utf8', (err, data) => {
            if (err) {
                throw err;
            }

            resolve(data);
        });
    })
        .then((data) => JSON.parse(data))
        .then((packageData) => {
            const {
                name,
                author,
                version,
                main,
                description,
                dependencies,
                } = packageData;

            const minimalPackage = {
                name,
                author,
                version,
                description,
                main,
                dependencies
            };

            return new Promise((resolve) => {
                const buildPath = path.resolve(__dirname, '../build/package.json');
                const data = JSON.stringify(minimalPackage, null, 2);
                fse.writeFile(buildPath, data, (err) => {
                    if (err) throw (err);
                    console.log(`Created package.json in ${buildPath}`);
                    resolve();
                });
            });
        });
}