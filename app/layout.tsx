import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'BioSkillsHub — Expertise, executable.',description:'A scientific skills library for research agents.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
