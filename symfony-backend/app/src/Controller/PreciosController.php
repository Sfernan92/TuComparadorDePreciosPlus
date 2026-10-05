<?php

namespace App\Controller;

use App\Entity\Precios;
use App\Repository\PreciosRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/precios')]
class PreciosController extends AbstractController
{
    #[Route('/', name: 'precios_index', methods: ['GET'])]
    public function index(PreciosRepository $preciosRepository): JsonResponse
    {
        $precios = $preciosRepository->findAll();

        $data = array_map(function (Precios $precio) {
            $producto = $precio->getProducto();
            $supermercado = $precio->getSupermercado();
            $categoria = $producto && $producto->getCategoria() ? $producto->getCategoria()->getNombre() : null;

            return [
                'id' => $precio->getId(),
                'precio' => $precio->getPrecio(),
                'producto_nombre' => $producto ? $producto->getNombre() : null,
                'supermercado_nombre' => $supermercado ? $supermercado->getNombre() : null,
                'producto_id' => $producto ? $producto->getId() : null,
                'categoria' => $categoria,
            ];
        }, $precios);

        return new JsonResponse($data);
    }

    #[Route('/{id}', name: 'precios_show', methods: ['GET'])]
    public function show(Precios $precio): JsonResponse
    {
        $data = [
            'id' => $precio->getId(),
        ];

        return new JsonResponse($data);
    }

    #[Route('/new', name: 'precios_new', methods: ['POST'])]
    public function new(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $precio = new Precios();

        // Asignar los valores recibidos (valida antes si quieres)
        if (isset($data['precio'])) {
            $precio->setPrecio((string) $data['precio']);
        } else {
            return new JsonResponse(['error' => 'El campo precio es obligatorio'], 400);
        }

        if (isset($data['producto_id'])) {
            $producto = $em->getRepository('App\Entity\Productos')->find($data['producto_id'] ?? 0);
            $precio->setProducto($producto);
        }

        if (isset($data['supermercado_id'])) {
            $supermercado = $em->getRepository('App\Entity\Supermercados')->find($data['supermercado_id'] ?? 0);
            $precio->setSupermercado($supermercado);
        }

        $em->persist($precio);
        $em->flush();

        return new JsonResponse([
            'message' => 'Precio creado',
            'id' => $precio->getId(),
        ], 201);
    }

    #[Route('/{id}/edit', name: 'precios_edit', methods: ['PUT', 'PATCH'])]
    public function edit(Request $request, Precios $precio, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['precio'])) {
            $precio->setPrecio((string) $data['precio']);
        }

        $em->flush();

        return new JsonResponse([
            'message' => 'Precio actualizado',
        ]);
    }

    #[Route('/{id}', name: 'precios_delete', methods: ['DELETE'])]
    public function delete(Request $request, Precios $precio, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($precio);
        $em->flush();

        return new JsonResponse([
            'message' => 'Precio eliminado',
        ]);
    }
}
