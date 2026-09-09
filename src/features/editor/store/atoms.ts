/**
 * =================================================================================================
 *                                 JOTAI & GLOBAL STATE MANAGEMENT
 * =================================================================================================
 * 
 * 1. WHAT IS JOTAI? (DEFINITION)
 * -------------------------------------------------------------------------------------------------
 * - Jotai (pronounced "joe-tie", Japanese for "state" / 状態) is a primitive, flexible, and 
 *   atomic state management library for React.
 * - Philosophy: "Atomic" State Management. Instead of storing all global state in one massive, 
 *   monolithic store (like traditional Redux), Jotai breaks state down into tiny, independent, 
 *   reusable units called **Atoms**.
 * - Atoms can be combined, derived, and subscribed to individually.
 * 
 * 
 * 2. KEY CONCEPTS IN JOTAI
 * -------------------------------------------------------------------------------------------------
 * A) Atom:
 *    - An atom is a definition of a piece of state.
 *    - It does NOT hold the value directly inside the atom definition itself; it acts as a key/config.
 *    - The actual state values live inside a Jotai Store (either default or provided via <Provider />).
 * 
 * B) Types of Atoms:
 *    - Primitive Atom: Holds a basic read/write value.
 *        const countAtom = atom(0);
 *    - Derived (Read-Only) Atom: Computes state dynamically from other atoms.
 *        const doubleCountAtom = atom((get) => get(countAtom) * 2);
 *    - Action (Write-Only) Atom: Encapsulates business logic / mutations without holding data itself.
 *        const resetCountAtom = atom(null, (get, set) => set(countAtom, 0));
 *    - Read-Write Derived Atom: Has both custom getter and setter logic.
 * 
 * C) Fine-Grained Reactivity (No Unnecessary Re-renders):
 *    - In React Context, whenever any value inside the context changes, ALL consuming components re-render.
 *    - In Jotai, a component re-renders ONLY when the specific atom it is subscribed to changes.
 * 
 * D) Essential Jotai Hooks:
 *    - `useAtom(atom)`:
 *        Returns `[value, setValue]` (works just like `useState`, but shared globally).
 *    - `useAtomValue(atom)`:
 *        Reads the current value only. Subscribes the component to re-renders when this atom updates.
 *    - `useSetAtom(atom)`:
 *        Returns only the updater function (`setValue`).
 *        *CRUCIAL OPTIMIZATION*: Components using `useSetAtom` do NOT re-render when the atom's 
 *        value changes because they are not reading the value!
 * 
 * 
 * 3. HOW JOTAI DIFFERS FROM tRPC + TANSTACK QUERY IN THIS PROJECT
 * -------------------------------------------------------------------------------------------------
 * In modern full-stack React applications, state is divided into two distinct categories:
 * 
 * ┌──────────────────────────────┬────────────────────────────────┬────────────────────────────────┐
 * │ Feature / Concern            │ Jotai (Client State)           │ tRPC + TanStack Query          │
 * │                              │                                │ (Server State)                 │
 * ├──────────────────────────────┼────────────────────────────────┼────────────────────────────────┤
 * │ Primary Purpose              │ UI / Ephemeral / Client-only   │ Remote / Async / Backend DB    │
 * │                              │ state needed across components │ data cached in the browser     │
 * ├──────────────────────────────┼────────────────────────────────┼────────────────────────────────┤
 * │ Source of Truth              │ In-memory (Client Browser RAM) │ Database / Server (PostgreSQL) │
 * ├──────────────────────────────┼────────────────────────────────┼────────────────────────────────┤
 * │ Persistence                  │ Lost on page refresh/unmount   │ Persisted on server DB         │
 * ├──────────────────────────────┼────────────────────────────────┼────────────────────────────────┤
 * │ Data Nature                  │ Synchronous, immediate UI refs │ Asynchronous network requests  │
 * │                              │ & interaction states           │ (loading, error, caching)      │
 * ├──────────────────────────────┼────────────────────────────────┼────────────────────────────────┤
 * │ Examples in this project     │ • `editorAtom` (ReactFlow)     │ • `trpc.workflows.getMany`     │
 * │                              │ • Active modal/drawer state    │ • `trpc.workflows.getOne`      │
 * │                              │ • Canvas zoom & pan coords     │ • `trpc.workflows.update`      │
 * │                              │ • Selected node IDs on canvas  │ • `trpc.workflows.execute`     │
 * └──────────────────────────────┴────────────────────────────────┴────────────────────────────────┘
 * 
 * 
 * 4. WHY DO WE USE JOTAI FOR `editorAtom` HERE?
 * -------------------------------------------------------------------------------------------------
 * - `ReactFlowInstance` is a live, interactive JavaScript instance that controls the workflow canvas 
 *   (zooming, panning, getting current nodes/edges positions in the viewport).
 * - It contains active methods like `editor.getNodes()` and `editor.getEdges()`.
 * - This instance CANNOT and SHOULD NOT be stored in a database or server state via tRPC/TanStack Query 
 *   because it is a complex runtime client object with functions and DOM bindings.
 * - However, we need access to this instance in header buttons (e.g. `EditorSaveButton` in `editor-header.tsx`), 
 *   which live in a completely different part of the component tree than the canvas itself.
 * - Jotai allows the canvas component to store the `ReactFlowInstance` in `editorAtom`, and the 
 *   `EditorSaveButton` can simply read it via `useAtomValue(editorAtom)` without prop drilling!
 * 
 * 
 * 5. HOW THEY WORK TOGETHER (THE COMPLETE FLOW IN THIS PROJECT):
 * -------------------------------------------------------------------------------------------------
 *   1. Canvas initializes -> Sets the live `ReactFlowInstance` into `editorAtom` (Jotai).
 *   2. User edits canvas -> Visual changes happen instantaneously in local ReactFlow state.
 *   3. User clicks Save in Header -> `EditorSaveButton` reads `editorAtom` (Jotai) to get `{ nodes, edges }`.
 *   4. Persist to Server -> `saveWorkflow.mutate({ id, nodes, edges })` (tRPC + TanStack Query) sends 
 *      the clean JSON payload to the database and invalidates the query cache.
 * =================================================================================================
 */

import type { ReactFlowInstance } from "@xyflow/react";
import { atom } from "jotai";

/**
 * Global atom holding the active ReactFlow editor instance.
 * Initialized as `null` until the canvas mounts and calls `setEditor(instance)`.
 * Consumed by components like `EditorSaveButton` to read current canvas nodes and edges.
 */
export const editorAtom = atom<ReactFlowInstance | null>(null);

