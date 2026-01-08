
import React from 'react';
import { YearbookData } from './types';

export const YEARBOOK_DATA: YearbookData = {
  schoolName: "Om Shanti English Medium School",
  year: "2025",
  grade: "Grade 12",
  pages: [
    {
      title: "Principal's Wisdom",
      content: (
        <div className="space-y-4">
          <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
            <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600" alt="Principal" className="w-full h-full object-cover" />
          </div>
          <p className="italic text-gray-700 leading-snug text-base font-serif">
            "Dear Class of 2025, As you stand at the threshold of a new chapter, I am filled with pride. Carry the values of integrity and kindness nurtured at OSEM."
          </p>
          <div className="pt-4 border-t border-amber-100">
            <p className="font-serif font-bold text-amber-900 text-lg">Dr. Sarah Johnson</p>
            <p className="text-[10px] text-amber-700 uppercase tracking-widest font-bold">Principal, OSEM</p>
          </div>
        </div>
      )
    },
    {
      title: "Student Profiles",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Aarav Sharma", role: "Head Boy", img: "https://i.pravatar.cc/150?u=aarav" },
              { name: "Isha Patel", role: "Valedictorian", img: "https://i.pravatar.cc/150?u=isha" },
              { name: "Rohan Gupta", role: "Sports Captain", img: "https://i.pravatar.cc/150?u=rohan" },
              { name: "Ananya Rao", role: "Arts Head", img: "https://i.pravatar.cc/150?u=ananya" }
            ].map((student, idx) => (
              <div key={idx} className="flex flex-col items-center p-2 bg-white border border-amber-50 rounded-lg shadow-sm">
                <img src={student.img} alt={student.name} className="w-10 h-10 rounded-full mb-1 border border-amber-200" />
                <p className="text-[10px] font-bold text-amber-950 text-center">{student.name}</p>
                <p className="text-[8px] text-amber-600/70 uppercase font-bold">{student.role}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-amber-800/60 font-serif italic italic pt-2">"A family that grew together."</p>
        </div>
      )
    },
    {
      title: "Hall of Fame",
      content: (
        <div className="space-y-4">
          <div className="relative h-44 bg-gray-200 rounded-lg overflow-hidden shadow-md">
             <img src="https://images.unsplash.com/photo-1523050853064-db0ef36e395e?auto=format&fit=crop&q=80&w=800" alt="Graduation" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             <div className="absolute bottom-2 left-3">
                <p className="text-white font-bold text-sm">Graduation 2024</p>
             </div>
          </div>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-xs text-gray-700"><span className="text-amber-500">🏆</span> 100% CBSE Pass Excellence</li>
            <li className="flex items-center gap-2 text-xs text-gray-700"><span className="text-amber-500">🏆</span> National Sports Champions</li>
            <li className="flex items-center gap-2 text-xs text-gray-700"><span className="text-amber-500">🏆</span> Science Olympiad Gold</li>
          </ul>
        </div>
      )
    },
    {
      title: "Final Sign-off",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 pt-4">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
            <span className="text-2xl">✒️</span>
          </div>
          <h3 className="text-3xl font-cursive text-amber-800">Until we meet again</h3>
          <p className="text-gray-600 font-serif italic text-sm px-2">
            "Every ending is just a new beginning. We carry the spirit of OSEM forever."
          </p>
          <div className="w-full h-12 border border-dashed border-amber-200 rounded flex items-center justify-center text-[8px] text-amber-300 uppercase font-black">Official Seal</div>
        </div>
      )
    }
  ]
};
