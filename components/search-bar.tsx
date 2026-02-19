"use client"

import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { Search } from "lucide-react"

export function SearchBar() {
    return (
        <InputGroup className="max-w-xs bg-background/50 backdrop-blur-sm">
            <InputGroupInput placeholder="Ara..." />
            <InputGroupAddon>
                <Search className="h-4 w-4" />
            </InputGroupAddon>
            {/* <InputGroupAddon align="inline-end">12 results</InputGroupAddon> */}
        </InputGroup>
    )
}
