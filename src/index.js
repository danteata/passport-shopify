/*
 * Framework version.
 */
import pkginfo from 'pkginfo';

pkginfo(module, 'version');
export const version = module.exports.version;

/*
 * Expose constructors.
 */
export { default as Strategy } from './strategy';
